#!/bin/sh
set -e

echo "====== Container Startup ======"
echo "Working directory: $(pwd)"
echo ""

echo "====== Checking build artifacts ======"
echo "Listing /app contents:"
ls -la /app | head -20
echo ""

echo "Attempting to execute: node main.js"
exec node main.js

