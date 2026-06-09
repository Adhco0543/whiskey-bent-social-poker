import { Card } from './card';
import { HandEvaluator, Hand } from './hand-evaluator';

export interface PlayerState {
  userId: string;
  hole: Card[];
  bet: number;
  folded: boolean;
}

export interface GameStateSnapshot {
  id: string;
  variant: 'NLH' | '5CS'; // No-Limit Hold'em or 5 Card Stud
  players: PlayerState[];
  communityCards: Card[];
  currentBet: number;
  pot: number;
  round: number; // 0=preflop, 1=flop, 2=turn, 3=river
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class GameState {
  private players: Map<string, PlayerState> = new Map();
  private communityCards: Card[] = [];
  private currentBet: number = 0;
  private pot: number = 0;
  private round: number = 0;
  private isActive: boolean = true;

  constructor(
    public id: string,
    public variant: 'NLH' | '5CS',
    public createdAt: Date,
  ) {}

  addPlayer(userId: string): void {
    if (!this.players.has(userId)) {
      this.players.set(userId, {
        userId,
        hole: [],
        bet: 0,
        folded: false,
      });
    }
  }

  dealHole(userId: string, cards: Card[]): void {
    const player = this.players.get(userId);
    if (player) {
      player.hole = cards;
    }
  }

  playerBet(userId: string, amount: number): void {
    const player = this.players.get(userId);
    if (player) {
      player.bet = amount;
      this.currentBet = Math.max(this.currentBet, amount);
      this.pot += amount;
    }
  }

  playerFold(userId: string): void {
    const player = this.players.get(userId);
    if (player) {
      player.folded = true;
    }
  }

  addCommunityCard(card: Card): void {
    this.communityCards.push(card);
  }

  nextRound(): void {
    this.round++;
    this.currentBet = 0;
    for (const player of this.players.values()) {
      player.bet = 0;
    }
  }

  endGame(): void {
    this.isActive = false;
  }

  getWinners(): Array<{ userId: string; hand: Hand }> {
    const activePlayers = Array.from(this.players.values()).filter((p) => !p.folded);
    if (activePlayers.length === 0) return [];

    const evaluated = activePlayers.map((p) => {
      const allCards = [...p.hole, ...this.communityCards];
      const hand = HandEvaluator.evaluate(allCards);
      return { userId: p.userId, hand };
    });

    // Sort by hand rank (higher is better), then by kickers
    evaluated.sort((a, b) => {
      if (b.hand.rank !== a.hand.rank) {
        return b.hand.rank - a.hand.rank;
      }
      // Compare kickers
      for (let i = 0; i < Math.min(a.hand.kickers.length, b.hand.kickers.length); i++) {
        if (b.hand.kickers[i].getRankValue() !== a.hand.kickers[i].getRankValue()) {
          return b.hand.kickers[i].getRankValue() - a.hand.kickers[i].getRankValue();
        }
      }
      return 0;
    });

    return evaluated;
  }

  toSnapshot(): GameStateSnapshot {
    return {
      id: this.id,
      variant: this.variant,
      players: Array.from(this.players.values()),
      communityCards: this.communityCards,
      currentBet: this.currentBet,
      pot: this.pot,
      round: this.round,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
