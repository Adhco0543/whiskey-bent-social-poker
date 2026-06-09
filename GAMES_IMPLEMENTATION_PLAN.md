# Games Implementation Plan: Slots & 5 Card Stud

## Overview
Add multiplayer gaming features to Whiskey Bent Social Poker platform with Slots and 5 Card Stud poker variants.

---

## Phase 1: Game Architecture & Infrastructure (Est: 4-6 hours)

### 1.1 Game Type Definitions
**File:** `packages/poker-core/src/game-types.ts`
- Create `GameType` enum: `SLOTS`, `FIVE_CARD_STUD`, `TEXAS_HOLDEM` (future)
- Define game rule configurations
- Create game state interfaces

### 1.2 Game Engine Framework
**File:** `packages/poker-core/src/game-engine/`
- `GameEngine.ts` - Abstract base class
- `GameState.ts` - Manages game state, rounds, turns
- `GameResult.ts` - Calculates outcomes and payouts
- `RNG.ts` - Random number generation for fair play

### 1.3 Game Session Management
**File:** `apps/api/src/modules/games/`
- Create `Games` module with services:
  - `GameSessionService` - Create/manage game sessions
  - `GameStateService` - Track real-time game state
  - `GameResultService` - Calculate outcomes and payouts
- Add database models for game history

### 1.4 Database Schema Extension
**File:** `packages/database/prisma/schema.prisma`
```prisma
model GameSession {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id])
  gameType String // SLOTS, FIVE_CARD_STUD
  betAmount Int
  walletCurrency String // SC or GC
  result String // WIN, LOSS, DRAW
  payout Int
  createdAt DateTime @default(now())
}

model GameResult {
  id String @id @default(cuid())
  sessionId String @unique
  gameSession GameSession @relation(fields: [sessionId], references: [id])
  details Json // Game-specific data
  payoutDetails Json // Payout breakdown
}
```

---

## Phase 2: Slots Game Implementation (Est: 3-4 hours)

### 2.1 Slots Engine
**File:** `packages/poker-core/src/engines/slots-engine.ts`
```typescript
class SlotsEngine extends GameEngine {
  reels: number[] // 3-5 reels
  symbols: string[] // cherry, bar, diamond, 7, etc.
  payTable: { [key: string]: number } // symbol combo → multiplier
  
  spin(): SpinResult
  evaluateResult(): PayoutInfo
}
```

**Spin Mechanics:**
- 5 symbols per reel
- 3-5 reels configurable
- Multiple winning lines (5-25 lines)
- Multiplier-based payouts

### 2.2 Slots API Endpoints
**File:** `apps/api/src/modules/games/controllers/slots.controller.ts`
- `POST /games/slots/spin` - Place bet, spin reels
- `GET /games/slots/history` - Get spin history
- `GET /games/slots/paytable` - Get payout info

### 2.3 Slots Frontend UI
**File:** `apps/web-player/src/app/games/slots/`
```
slots/
  page.tsx          # Main slots interface
  SlotsGame.tsx     # Game component
  ReelSpinner.tsx   # Animated reel component
  PayTable.tsx      # Payout table display
  slots.css         # Spinning animations
```

**Features:**
- Animated reel spinning (3 reps + deceleration)
- Bet amount selector
- Real-time balance updates
- Win notification with payout
- Game history table

---

## Phase 3: 5 Card Stud Implementation (Est: 5-7 hours)

### 3.1 5 Card Stud Engine
**File:** `packages/poker-core/src/engines/five-card-stud-engine.ts`
```typescript
class FiveCardStudEngine extends GameEngine {
  deck: Card[]
  players: Player[]
  communityCards: Card[]
  currentRound: number // 1-5
  
  dealInitialCards(): void
  evaluateHand(cards: Card[]): HandRank
  getWinner(): Player
  calculatePayout(): number
}
```

**Game Flow:**
1. Initial deal (each player gets 1 hole card, 1 community card)
2. Betting round 1
3. Additional community cards (4 more rounds)
4. Betting after each card
5. Showdown - reveal hands
6. Calculate winner & payouts

### 3.2 Hand Evaluation
**File:** `packages/poker-core/src/hand-evaluator.ts`
```typescript
class HandEvaluator {
  static evaluate(cards: Card[]): HandRank
  // HandRank: ROYAL_FLUSH, STRAIGHT_FLUSH, FOUR_OF_A_KIND, etc.
  
  private static getHighCard(cards: Card[]): Card
  private static isPair(cards: Card[]): boolean
  private static isStraight(cards: Card[]): boolean
}
```

### 3.3 5 Card Stud API Endpoints
**File:** `apps/api/src/modules/games/controllers/five-card-stud.controller.ts`
- `POST /games/5-card-stud/create` - Create game session
- `POST /games/5-card-stud/action` - Player action (fold, check, bet, raise, call)
- `GET /games/5-card-stud/:sessionId` - Get game state
- `GET /games/5-card-stud/history` - Game history

### 3.4 5 Card Stud Frontend UI
**File:** `apps/web-player/src/app/games/five-card-stud/`
```
five-card-stud/
  page.tsx              # Game lobby
  GameTable.tsx         # Main game table
  PlayerSeats.tsx       # Player positions
  CommunityCards.tsx    # Visible cards
  ActionButtons.tsx     # Fold, check, bet, raise, call
  BettingControls.tsx   # Bet amount selector
  GameHistory.tsx       # Hand history
```

**Features:**
- Real-time player hand display
- Action queue (fold, check, bet, raise, call)
- Pot calculation
- Player balance tracking
- Community cards revelation (phased)
- Hand evaluation display at showdown

---

## Phase 4: Game Session & Wallet Integration (Est: 2-3 hours)

### 4.1 Wallet Integration
**File:** `apps/api/src/modules/games/services/game-payout.service.ts`
- Deduct bet from player wallet on game start
- Award winnings to wallet on completion
- Track game currency separately (SC vs GC)
- Prevent playing with insufficient balance

### 4.2 Game History & Analytics
**File:** `apps/api/src/modules/games/controllers/games.controller.ts`
- `GET /games/history` - All games played
- `GET /games/stats` - Win/loss stats by game type
- `GET /games/leaderboard` - Top winners

### 4.3 CORS & API Integration
**File:** `apps/api/src/main.ts`
- Enable CORS for game requests
- Add game endpoints to API routes

---

## Phase 5: Frontend Game Lobby (Est: 2-3 hours)

### 5.1 Game Selection UI
**File:** `apps/web-player/src/app/games/page.tsx`
```
Games Lobby:
  - Slots card (click to play)
  - 5 Card Stud card (click to play)
  - Game stats/history
  - Balance display
```

### 5.2 Games Navigation
**File:** `apps/web-player/src/app/layout.tsx`
- Add "Games" link in navbar
- Add routing to `/games` lobby

---

## Implementation Timeline

| Phase | Task | Est. Time |
|-------|------|-----------|
| 1 | Game architecture & database | 4-6 hrs |
| 2 | Slots engine & UI | 3-4 hrs |
| 3 | 5 Card Stud engine & UI | 5-7 hrs |
| 4 | Wallet & history integration | 2-3 hrs |
| 5 | Game lobby frontend | 2-3 hrs |
| **Total** | | **16-23 hrs** |

---

## Technical Decisions

### Random Number Generation
- Use `crypto.getRandomValues()` for fair, non-deterministic RNG
- Consider blockchain for provably fair gaming (future)

### Multiplayer Architecture
- Use WebSocket (realtime gateway) for real-time game updates
- Implement turn-based state machine for concurrent players
- Add client-side validation with server verification

### Payout Structure (Configurable)

**Slots Example:**
- 3x Cherry = 2x bet
- 3x Bar = 5x bet
- 3x 7s = 10x bet (jackpot)
- RTP: 95% (house keeps 5%)

**5 Card Stud Example:**
- Ante: 0.1x bet
- Standard poker hand payouts
- Rake (5-10%) on pot for platform

---

## Next Steps

1. **Choose starting point:** Slots (simpler) or 5 Card Stud (complex but better engagement)
2. **Database migration:** Run Prisma migrations for new models
3. **Implement chosen game** following the architecture above
4. **Integration testing:** Test wallet deductions, payouts, CORS
5. **Frontend testing:** Play multiple rounds, verify payouts
6. **Deploy** and monitor

---

## Questions to Clarify

- [ ] Max bet amounts per game?
- [ ] House edge/RTP targets?
- [ ] Single-player or multiplayer 5 Card Stud?
- [ ] Minimum player count for table games?
- [ ] Currency: SC only or mix SC+GC?
- [ ] Leaderboard timeframe (daily, weekly, all-time)?

