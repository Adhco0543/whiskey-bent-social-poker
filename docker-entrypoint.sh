#!/bin/sh

echo "====== Container Startup ======"
echo "Working directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo "YES" || echo "NO")"
echo ""

echo "====== Checking for main.js ======"
MAIN_JS="/app/apps/api/dist/main.js"

if [ ! -f "$MAIN_JS" ]; then
  echo "✗ ERROR: main.js not found at $MAIN_JS"
  echo ""
  echo "Directory structure:"
  find /app -maxdepth 3 -type f -name "*.js" | head -20
  exit 1
fi

echo "✓ Found main.js at: $MAIN_JS"
echo ""
echo "====== Starting NestJS application ======"

# Run Node.js with error output visible - don't use exec so we can catch the exit code
node "$MAIN_JS"
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "✗ Node.js process exited with code: $EXIT_CODE"
  exit $EXIT_CODE
fi
