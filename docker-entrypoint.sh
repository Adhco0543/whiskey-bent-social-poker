#!/bin/sh
set -e

echo "====== Container Startup ======"
echo "Working directory: $(pwd)"
echo ""

echo "====== Checking build artifacts ======"
echo "Listing /app contents:"
ls -la /app
echo ""

echo "Listing /app/apps/api/dist contents:"
ls -la /app/apps/api/dist 2>/dev/null || echo "dist directory not found"
echo ""

echo "Attempting to execute: node /app/apps/api/dist/main.js"
exec node /app/apps/api/dist/main.js

