#!/bin/sh
set -e

echo "====== Container Startup ======"
echo "Working directory: $(pwd)"
echo ""

echo "====== Checking build artifacts ======"
echo "Listing /app contents:"
ls -la /app
echo ""
echo "Looking for main.js:"
ls -la main.js 2>/dev/null || echo "NOT FOUND"
echo ""

echo "Attempting to execute: node main.js"
exec node main.js

