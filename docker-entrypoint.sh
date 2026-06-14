#!/bin/sh
set -e

echo "====== Container Startup ======"
echo "Working directory: $(pwd)"
echo ""

echo "====== Checking build artifacts ======"
echo "Listing /app contents:"
ls -la /app
echo ""

echo "====== Searching for main.js ======"
MAIN_JS=$(find /app -name "main.js" -type f 2>/dev/null | head -1)
if [ -z "$MAIN_JS" ]; then
  echo "ERROR: main.js not found anywhere in /app"
  echo "=== Full directory tree ==="
  find /app -type f -name "*.js" 2>/dev/null | head -30
  exit 1
fi

echo "Found main.js at: $MAIN_JS"
echo "Attempting to execute: node $MAIN_JS"
exec node "$MAIN_JS"

