#!/bin/sh
set -e

echo "====== Container Startup ======"
echo "Working directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

echo "====== Checking for main.js ======"
MAIN_JS="/app/apps/api/dist/main.js"

if [ -f "$MAIN_JS" ]; then
  echo "✓ Found main.js at: $MAIN_JS"
  echo "Starting NestJS application..."
  exec node "$MAIN_JS"
else
  echo "✗ ERROR: main.js not found at $MAIN_JS"
  echo ""
  echo "Directory structure:"
  find /app -maxdepth 3 -type f -name "*.js" | head -20
  echo ""
  echo "Full /app contents:"
  ls -la /app
  exit 1
fi


