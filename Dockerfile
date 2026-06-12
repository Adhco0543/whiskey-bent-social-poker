# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time argument for Prisma schema validation
ARG DATABASE_URL=postgresql://user:password@localhost:5432/dummy
ENV DATABASE_URL=$DATABASE_URL
ENV PRISMA_SKIP_VALIDATION=true
ENV PRISMA_SKIP_ENGINE_CHECK=true

# Install build dependencies (including openssl for Prisma)
RUN apk add --no-cache python3 make g++ openssl

# Copy package files
COPY package.json package-lock.json ./
COPY tsconfig.base.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/database/tsconfig.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/types/tsconfig.json ./packages/types/
COPY packages/poker-core/package.json ./packages/poker-core/
COPY packages/poker-core/tsconfig.json ./packages/poker-core/

# Install dependencies
RUN npm ci

# Copy source code (needed for TypeScript build)
COPY apps/api ./apps/api
COPY packages/database ./packages/database
COPY packages/types ./packages/types
COPY packages/poker-core ./packages/poker-core

# Build using turbo (handles dependencies automatically)
# Skip Prisma generation during build - will do it at runtime when DATABASE_URL is available
# The @prisma/client types from node_modules are sufficient for TypeScript compilation
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies (including openssl for Prisma)
RUN apk add --no-cache tini openssl

# Copy built files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/poker-core/dist ./packages/poker-core/dist
COPY --from=builder /app/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Fix permissions for Prisma and node_modules (so nodejs user can generate Prisma client at runtime)
RUN chmod -R 755 /app && \
    chown -R nodejs:nodejs /app/node_modules && \
    chown -R nodejs:nodejs /app/dist 2>/dev/null || true && \
    chown -R nodejs:nodejs /app/packages 2>/dev/null || true

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start application with Prisma setup and migrations
EXPOSE 3000
ENV NODE_ENV=production
CMD sh -c "npx prisma generate --schema=./packages/database/prisma/schema.prisma && npx prisma db push --schema=./packages/database/prisma/schema.prisma && node dist/main.js"
