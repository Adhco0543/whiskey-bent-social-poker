#!/bin/bash
# Database setup script
# Make sure PostgreSQL is running before running this script

echo "Setting up PostgreSQL database..."

# Create database
createdb -U postgres whiskey_bent

# Run Prisma migrations
cd packages/database
npx prisma migrate deploy
npx prisma db seed || true

echo "Database setup complete!"
