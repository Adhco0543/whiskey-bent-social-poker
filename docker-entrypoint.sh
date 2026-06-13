#!/bin/sh
set -e

echo "====== Container Startup ======"
echo "Working directory: $(pwd)"
echo ""

echo "====== Checking build artifacts ======"
echo "Listing /app contents:"
ls -la /app
echo ""
echo "Listing /app/dist contents:"
ls -la /app/dist 2>/dev/null || echo "(dist directory not accessible)"
echo ""

echo "Attempting to execute: node dist/main.js"
exec node dist/main.js

