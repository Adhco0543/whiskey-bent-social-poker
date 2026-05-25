# Whiskey Bent Social Poker

Whiskey Bent Social Poker is a web-first social poker / sweepstakes platform designed around Gold Coins (GC) for entertainment play and Sweep Coins (SC) for promotional participation where permitted.

## Platform goals
- No-Limit Hold'em
- Pot-Limit Omaha
- Sit & Go tournaments
- Multi-table tournaments
- Jurisdiction-aware eligibility
- Dual-wallet ledger system
- Web-first architecture

## Monorepo structure
- `apps/web-player` — player-facing web app
- `apps/web-admin` — admin portal
- `apps/api` — backend API
- `apps/realtime` — realtime gameplay gateway
- `packages/database` — Prisma schema and DB package
- `packages/types` — shared TypeScript types
- `packages/ui` — shared UI components
- `packages/poker-core` — poker domain logic
- `packages/tournament-core` — tournament domain logic
- `packages/compliance-rules` — compliance/jurisdiction rules

## Stack
- pnpm workspaces
- Turborepo
- Next.js
- NestJS
- Prisma
- PostgreSQL
- Redis
- TypeScript

## Getting started
1. Install dependencies
2. Copy `.env.example` to `.env`
3. Start PostgreSQL
4. Run Prisma migrations
5. Start dev services

## Notes
This project is intended as a compliance-first social poker platform with no direct real-money wagering.
