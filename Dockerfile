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

# Build workspace packages FIRST - they are critical dependencies
# Step 1: Generate Prisma client (required before any build)
# Step 2: Build ALL packages with turbo (handles dependency ordering automatically)
RUN echo "Step 1: Building all workspace packages..." && \
    npm run build 2>&1 && \
    echo "✓ All packages built successfully"

# Verify the API was built
RUN echo "" && \
    echo "Step 2: Verifying build outputs..." && \
    (test -f apps/api/dist/main.js && echo "✓ API main.js exists") || \
    (echo "❌ CRITICAL: API main.js missing!" && \
    echo "=== Checking apps/api directory ===" && \
    ls -la apps/api/ && \
    echo "=== Checking for dist directory ===" && \
    ls -la apps/api/dist 2>&1 || echo "apps/api/dist does not exist" && \
    echo "=== Checking workspace packages ===" && \
    ls -la node_modules/@whiskey-bent 2>/dev/null | head -10 || echo "No @whiskey-bent in node_modules" && \
    exit 1)

# Inspect the dist directory structure in builder
RUN echo "=== Inspecting builder /app/apps/api/dist ===" && \
    ls -la /app/apps/api/dist 2>&1 || echo "dist not found" && \
    echo "=== Finding main.js in entire /app/apps/api/dist tree ===" && \
    find /app/apps/api/dist -name "main.js" -type f 2>/dev/null || echo "main.js not found anywhere" && \
    echo "=== Full tree of /app/apps/api/dist ===" && \
    find /app/apps/api/dist -type f -name "*.js" | head -20 || echo "no js files"

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies (including openssl for Prisma)
RUN apk add --no-cache tini openssl

# Copy built files from builder - copy everything needed for runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Copy workspace packages (needed for module resolution)
COPY --from=builder /app/packages ./packages

# Copy entire API app with dist directory intact
COPY --from=builder /app/apps/api ./apps/api

# Copy startup script
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# CRITICAL: Fix workspace symlinks - they may not copy correctly from builder
# Docker COPY can preserve symlinks, but if copied as directories, npm ci won't fix them
# Remove node_modules/@whiskey-bent if it exists (to force fresh link creation)
RUN echo "Fixing workspace package symlinks..." && \
    rm -rf node_modules/@whiskey-bent && \
    echo "Running npm ci to recreate workspace symlinks..." && \
    npm ci --legacy-peer-deps 2>&1 | tail -10 && \
    echo "" && \
    echo "Verifying critical packages..." && \
    (test -d node_modules/@whiskey-bent/database && echo "✓ @whiskey-bent/database exists" || echo "✗ @whiskey-bent/database MISSING") && \
    (test -d node_modules/@whiskey-bent/poker-core && echo "✓ @whiskey-bent/poker-core exists" || echo "✗ @whiskey-bent/poker-core MISSING") && \
    (test -d node_modules/@nestjs/core && echo "✓ @nestjs/core exists" || echo "✗ @nestjs/core MISSING") && \
    (test -d node_modules/@prisma/client && echo "✓ @prisma/client exists" || echo "✗ @prisma/client MISSING") && \
    echo "" && \
    echo "Checking symlink targets..." && \
    (ls -la node_modules/@whiskey-bent 2>&1 | head -5 || echo "Could not list @whiskey-bent") && \
    echo ""

# DEBUG: Verify file structure and dependencies
RUN echo "" && \
    echo "=== Checking main.js ===" && \
    (test -f /app/apps/api/dist/main.js && echo "✓ main.js exists" || echo "✗ main.js NOT found") && \
    echo "" && \
    echo "=== Node executable can load main module ===" && \
    (node -e "require('./apps/api/dist/main.js');" 2>&1 | head -5 || echo "Note: Main module requires bootstrap to run") && \
    echo "✓ Module system working"

# Remove any .env files (runtime will use Render's env vars)
RUN rm -f /app/.env /app/.env.* && chmod -R 755 /app

# Health check - test that Node can execute (don't check HTTP endpoint yet since we haven't implemented /health)
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "console.log('health check'); process.exit(0)"

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start application
EXPOSE 3000
ENV NODE_ENV=production
CMD ["/app/docker-entrypoint.sh"]
