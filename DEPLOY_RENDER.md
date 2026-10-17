# Render deployment (API)

This repository's default branch is main. For the existing Docker web
service, use:

- Branch: main (after the PR has been reviewed and merged)
- Root Directory: leave blank (monorepo root)
- Dockerfile Path: ./Dockerfile
- Health Check Path: /health
- Port: provided automatically by Render via PORT (the API binds to 0.0.0.0)

Required environment variables for the API web service:

- DATABASE_URL: PostgreSQL connection string, supplied privately in Render.
- JWT_SECRET: a unique, cryptographically random secret at least 32 characters long.
- CORS_ORIGIN: comma-separated HTTPS URLs of the player/admin frontends.
- NODE_ENV: production (already set in Docker image).

Do not enter PostgreSQL's port 5432 as the web service port. PostgreSQL
uses its own network port. The API serves HTTP on Render's PORT, falling
back to 3000 locally.

The Dockerfile installs workspace dependencies, generates Prisma client,
and builds the API. The existing database must be provisioned and schema
migration/reconciliation verified before starting the live API.

Run the poker-core test script before release. Authentication and promotional
sweepstakes redemptions require further security/compliance checks.
