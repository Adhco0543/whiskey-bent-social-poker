# Whiskey Bent Social Poker

Whiskey Bent Social Poker is a web-first social poker/sweepstakes platform designed around Gold Coins (GC) for entertainment play and Sweep Coins (SC) for promotional participation where permitted. This platform offers a cutting-edge and compliance-first poker experience.

---

## 🎯 **Platform Goals**
- Support for No-Limit Hold'em
- Pot-Limit Omaha functionality
- Sit & Go tournaments
- Multi-table tournaments
- Jurisdiction-aware player eligibility
- Dual-wallet ledger system for virtual currencies (GC and SC)
- Web-first architecture for enhanced accessibility

---

## 🏗️ **Monorepo Structure**
This repository is structured as a monorepo using Turborepo to manage the following:

### **Applications**
- `apps/web-player` — Player-facing web app
- `apps/web-admin` — Admin control portal
- `apps/api` — Backend API for core functionalities
- `apps/realtime` — Realtime gameplay gateway

### **Packages**
- `packages/database` — Prisma schema and shared database logic
- `packages/types` — Shared TypeScript definitions
- `packages/ui` — Reusable UI components
- `packages/poker-core` — Poker domain logic and gameplay rules
- `packages/tournament-core` — Tournament lifecycle management logic
- `packages/compliance-rules` — Jurisdiction-specific compliance rules

---

## 🛠️ **Technology Stack**
The platform leverages the following technology stack:

- **Monorepo Management**: PNPM Workspaces, Turborepo
- **Frontend**: Next.js
- **Backend**: NestJS
- **Database**: Prisma, PostgreSQL
- **Real-time Support**: Redis
- **Programming Language**: TypeScript

---

## 🚀 **Getting Started**
Follow these steps to set up and run the platform locally:

1. **Install Dependencies**: Run `pnpm install`.
2. **Environment Variables**:
   - Copy `.env.example` to `.env`.
   - Fill in the necessary environment variables (e.g., database credentials).
3. **Database Setup**:
   - Start PostgreSQL.
   - Run Prisma migrations using `pnpm prisma migrate dev`.
4. **Start Development Services**:
   - Launch all apps and services using `pnpm turbo dev`.

---

## 📄 **Notes**
- This platform is **compliance-first** with no real-money wagering.
- Designed for entertaining poker experiences while adhering to jurisdictional rules.

---

## 📜 **License**
This repository is licensed under [Insert License Here]. Please review the LICENSE.md file for more information.

---

## 💡 **Future Enhancements**
- **AI Integration**:
  - Smart matchmaking and tournament scheduling.
  - Real-time gameplay insights powered by AI.
- **Improved Automation**:
  - CI/CD pipelines for streamlined testing and deployment.
- **Enhanced Testing**:
  - Increase coverage for poker core and compliance rules.

---

For more details, refer to individual modules or contact the repository maintainer.