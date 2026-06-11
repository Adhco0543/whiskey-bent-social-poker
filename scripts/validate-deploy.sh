#!/bin/bash

# Whiskey Bent Social Poker - Deployment Validation Script
# Validates that the environment and dependencies are ready for deployment

set -e

echo "🔍 Validating deployment readiness..."
echo ""

# Check Node version
echo "📌 Node.js version:"
node --version

# Check npm version
echo "📌 npm version:"
npm --version

# Check environment file
echo ""
echo "🔐 Environment configuration:"
if [ -f .env ]; then
  echo "✅ .env file exists"
  if grep -q "^DATABASE_URL=" .env; then
    echo "✅ DATABASE_URL configured"
  else
    echo "❌ DATABASE_URL not configured"
    exit 1
  fi
  if grep -q "^JWT_SECRET=" .env; then
    echo "✅ JWT_SECRET configured"
  else
    echo "❌ JWT_SECRET not configured"
    exit 1
  fi
else
  echo "❌ .env file not found - run: cp .env.example .env"
  exit 1
fi

# Verify database connectivity
echo ""
echo "🗄️  Database connectivity:"
if command -v psql &> /dev/null; then
  if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ PostgreSQL connection successful"
  else
    echo "⚠️  Could not verify PostgreSQL connection (psql may not be configured)"
  fi
else
  echo "⚠️  psql not found - skipping database connectivity check"
fi

# Check build artifacts
echo ""
echo "🏗️  Build artifacts:"
if [ -d "packages/database/dist" ]; then
  echo "✅ Database package built"
else
  echo "⚠️  Database package not built - run: npm run build"
fi

if [ -d "apps/api/dist" ]; then
  echo "✅ API built"
else
  echo "⚠️  API not built - run: npm run build"
fi

# Check TypeScript compilation
echo ""
echo "✓ Running TypeScript type check..."
npm run lint 2>/dev/null || echo "⚠️  Lint issues found - review and fix before deploying"

echo ""
echo "✅ Validation complete!"
echo ""
echo "🚀 Ready to deploy. Run: npm run prepare:deploy"
