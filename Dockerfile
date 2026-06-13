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

# Copy .env.example as .env FIRST for Prisma to find DATABASE_URL during entire build
COPY .env.example .env

# Copy package files
COPY package.json package-lock.json ./
COPY tsconfig.base.json turbo.json ./

# Copy ALL packages (app and library package.json + tsconfig files)
COPY apps ./apps
COPY packages ./packages

# Install dependencies
# Use --legacy-peer-deps to avoid peer dependency conflicts
RUN npm ci --legacy-peer-deps 2>&1 | tail -20

# Copy Prisma schema (needed for client generation)
COPY packages/database/prisma ./packages/database/prisma

# Generate Prisma client types explicitly
RUN echo "Generating Prisma client types..." && \
    npx prisma generate --schema=./packages/database/prisma/schema.prisma && \
    echo "✓ Prisma client generated successfully" && \
    ls -la node_modules/@prisma/client/index.d.ts || echo "⚠️ @prisma/client/index.d.ts not found"

# Build the applications
RUN echo "Starting build process..." && \
    npm run build 2>&1 && \
    echo "✓ Build completed successfully" || \
    (echo "❌ Build FAILED - Collecting diagnostics..." && \
    echo "=== apps/api directory ===" && \
    ls -la apps/api/ && \
    echo "=== Checking for dist dirs ===" && \
    find apps -maxdepth 2 -name "dist" -type d && \
    echo "=== npm logs ===" && \
    (tail -100 /root/.npm/_logs/*.log 2>/dev/null || echo "No npm logs") && \
    exit 1)

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies (including openssl for Prisma)
RUN apk add --no-cache tini openssl

# Copy built files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

# Remove any .env files from build stage (runtime will use Render's env vars)
RUN rm -f /app/.env /app/.env.* && \
    chmod -R 755 /app

# Create non-root user and set permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start application with Prisma setup
EXPOSE 3000
ENV NODE_ENV=production
CMD sh -c "echo 'Working directory:' && pwd && \
    echo 'Checking dist directory:' && ls -la dist/ && \
    echo 'Running Prisma generate...' && npx prisma generate --schema=./packages/database/prisma/schema.prisma && \
    echo 'Running Prisma db push...' && npx prisma db push --schema=./packages/database/prisma/schema.prisma && \
    echo 'Starting Node.js...' && exec node dist/main.js"
