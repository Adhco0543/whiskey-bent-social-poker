#!/bin/bash
# Start all services in development mode

echo "Starting all services..."

# Install dependencies
pnpm install

# Start in turbo (runs all dev tasks)
pnpm dev
