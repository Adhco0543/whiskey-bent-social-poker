#!/bin/sh
set -e

echo "====== Container Startup ======"
echo "Working directory: $(pwd)"
echo "Listing /app:"
ls -la /app | grep "main.js\|modules\|packages" || echo "No matches"
echo ""

# Try to find and execute main.js
if [ -f "/app/main.js" ]; then
  echo "Found main.js at /app/main.js"
  exec node /app/main.js
elif [ -f "./main.js" ]; then
  echo "Found main.js at ./main.js"
  exec node ./main.js  
else
  echo "ERROR: main.js not found in /app"
  echo "Full /app contents:"
  ls -la /app
  exit 1
fi


