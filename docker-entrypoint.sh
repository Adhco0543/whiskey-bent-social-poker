#!/bin/sh
set -e

echo "====== Container Startup ======"
echo "Working directory: $(pwd)"
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

echo "====== Checking build artifacts ======"
if [ -f "dist/main.js" ]; then
  echo "✓ dist/main.js exists"
  ls -lh dist/main.js
else
  echo "✗ dist/main.js NOT FOUND"
  echo "Contents of dist/:"
  ls -la dist/ 2>/dev/null || echo "dist directory not found!"
  exit 1
fi

if [ -d "node_modules" ]; then
  echo "✓ node_modules directory exists"
  echo "  Size: $(du -sh node_modules | cut -f1)"
else
  echo "✗ node_modules NOT FOUND"
  ls -la . | grep modules
  exit 1
fi

echo ""
echo "====== Setting up Prisma ======"

# Generate Prisma client
if [ -n "$DATABASE_URL" ]; then
  echo "Generating Prisma client..."
  if npx prisma generate --schema=./packages/database/prisma/schema.prisma; then
    echo "✓ Prisma client generated"
  else
    echo "✗ Prisma client generation failed"
    exit 1
  fi
else
  echo "⚠ DATABASE_URL not set, skipping Prisma setup"
fi

echo ""
echo "====== Starting Node application ======"
echo "NODE_ENV=${NODE_ENV}"
exec node dist/main.js
