# Whiskey Bent Social Poker - Setup Guide

## Project Structure

This is a Turbo monorepo containing a full-stack social poker platform.

### Applications

- **apps/api** - NestJS backend API (port 3000)
- **apps/web-player** - Next.js player-facing web app (port 3000)
- **apps/web-admin** - Next.js admin portal (port 3001)
- **apps/realtime** - Real-time gameplay gateway using WebSockets (port 3001)

### Packages

- **packages/database** - Prisma schema and database utilities
- **packages/types** - Shared TypeScript type definitions
- **packages/ui** - Reusable React UI components
- **packages/poker-core** - Poker game logic and rules
- **packages/tournament-core** - Tournament management logic
- **packages/compliance-rules** - Jurisdiction compliance engine

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Setup Database

```bash
# Run migrations
cd packages/database
pnpm run migrate
```

### 4. Start Development

```bash
pnpm dev
```

This will start all services in development mode:
- API: http://localhost:3000
- Web Player: http://localhost:3000
- Web Admin: http://localhost:3001
- Realtime: ws://localhost:3001

## 🎁 Bonus System Implementation

### Sign-Up Bonus
- **Amount**: 5 Sweep Coins (SC)
- **Trigger**: Automatically awarded when user creates account
- **Logic**: `AuthService.signup()` calls `addBonusToWallet()`

### Daily Login Bonus
- **Amount**: 5 Sweep Coins (SC)
- **Frequency**: Once per calendar day
- **Trigger**: User calls `/bonus/daily-login` endpoint
- **Check**: `canClaimDailyBonus()` prevents duplicate claims

### API Endpoints

#### Authentication
- `POST /auth/signup` - Create new account (awards 5 SC)
- `POST /auth/login` - Login to account (tracks daily login)

#### Bonuses
- `POST /bonus/daily-login` - Claim daily bonus (5 SC)
- `GET /bonus/can-claim` - Check if daily bonus available
- `GET /bonus/history` - View bonus history

#### User
- `GET /users/profile` - Get user profile
- `GET /users/wallet` - Get wallet balance (GC and SC)

## 🔧 Development

### Build All Packages
```bash
pnpm build
```

### Run Tests
```bash
pnpm test
```

### Lint Code
```bash
pnpm lint
```

### Format Code
```bash
pnpm format
```

## 📊 Database Schema

Key tables:
- `users` - User accounts
- `wallets` - Dual-wallet ledger (GC/SC)
- `bonus_records` - Bonus history tracking
- `daily_logins` - Daily login tracking
- `game_sessions` - Active games
- `tournaments` - Tournament definitions

## 🔐 Security Notes

- JWT-based authentication with 7-day expiry
- Password hashing recommended (bcrypt) - placeholder in demo
- Compliance engine for jurisdiction-specific rules
- All bonuses tracked for audit purposes

## 📝 Notes

- This is a **compliance-first** platform with no real money wagering
- Designed for entertaining poker experiences within legal constraints
- Frontend uses Tailwind CSS and shadcn-style components
- Backend uses NestJS with Prisma ORM

---

For more details on specific modules, refer to individual package READMEs.
