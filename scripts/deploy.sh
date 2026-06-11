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
npm ci

# Build workspace packages first
echo "🔨 Building workspace packages..."
cd packages/database
npm run build
cd ../types
npm run build
cd ../ui
npm run build
cd ../poker-core
npm run build
cd ../tournament-core
npm run build
cd ../compliance-rules
npm run build
cd ../..

# Build applications
echo "🏗️  Building applications..."
npm run build:prod

# Run database migrations
echo "🗄️  Running database migrations..."
cd packages/database
npm run migrate -- --skip-generate
cd ../..

echo "✅ Deployment preparation complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Verify all builds completed successfully"
echo "  2. Review database migrations"
echo "  3. Deploy to your infrastructure"
echo ""
echo "🚀 To start services:"
echo "  - API:     npm run start"
echo "  - Realtime: npm run start:realtime"
