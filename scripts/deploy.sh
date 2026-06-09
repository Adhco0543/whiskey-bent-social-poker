#!/bin/bash

# Whiskey Bent Social Poker - Production Deployment Script
# This script prepares and validates the application for production deployment

set -e

echo "🚀 Starting Whiskey Bent Social Poker Deployment..."

# Check environment variables
echo "📋 Checking required environment variables..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL not set"
  exit 1
fi

if [ -z "$JWT_SECRET" ]; then
  echo "❌ Error: JWT_SECRET not set"
  exit 1
fi

if [ -z "$NODE_ENV" ]; then
  echo "⚠️  NODE_ENV not set, defaulting to production"
  export NODE_ENV=production
fi

echo "✅ Environment variables validated"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build workspace packages first
echo "🔨 Building workspace packages..."
cd packages/database
pnpm build
cd ../types
pnpm build
cd ../ui
pnpm build
cd ../poker-core
pnpm build
cd ../tournament-core
pnpm build
cd ../compliance-rules
pnpm build
cd ../..

# Build applications
echo "🏗️  Building applications..."
pnpm build:prod

# Run database migrations
echo "🗄️  Running database migrations..."
cd packages/database
pnpm run migrate -- --skip-generate
cd ../..

echo "✅ Deployment preparation complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Verify all builds completed successfully"
echo "  2. Review database migrations"
echo "  3. Deploy to your infrastructure"
echo ""
echo "🚀 To start services:"
echo "  - API:     pnpm run start"
echo "  - Realtime: pnpm run start:realtime"
