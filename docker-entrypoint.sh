#!/bin/sh
set -e

echo "====== Container Startup ======"
echo "Working directory: $(pwd)"
echo ""

echo "====== Checking build artifacts ======"
echo "Listing dist/ contents:"
ls -la dist/
echo ""

echo "Attempting to execute: node dist/main.js"
exec node dist/main.js

