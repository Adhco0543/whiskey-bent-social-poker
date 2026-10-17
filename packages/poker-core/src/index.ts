import { randomInt } from 'node:crypto';

/**
 * Server-side deterministic poker hand ranking.
 * Card notation: Ah, Td, 10c, 2s (rank then suit).
 * Results are comparable lexicographically: category, then kickers.
 */
export interface HandResult {
  category: number;
  kickers: number[];
  score: number[];
}

type Card = { rank: number; suit: string; id: string };
const rankMap: Record<string, number> = {
  T: 10, J: 11, Q: 12, K: 13, A: 14,
};

function parseCards(values: string[]): Card[] {
  const ids = new Set<string>();
  return values.map((value) => {
    const match = /^(10|[2-9TJQKA])([CDHS])$/i.exec(value);
    if (!match) throw new Error('Invalid card: ' + value);
    const symbol = match[1].toUpperCase() === '10' ? 'T' : match[1].toUpperCase();
    const suit = match[2].toLowerCase();
    const id = symbol + suit;
    if (ids.has(id)) throw new Error('Duplicate card: ' + value);
    ids.add(id);
    return { rank: rankMap[symbol] ?? Number(symbol), suit, id };
  });
}

function compareScores(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const difference = (a[i] ?? 0) - (b[i] ?? 0);
    if (difference !== 0) return Math.sign(difference);
  }
  return 0;
}

function scoreFive(cards: Card[]): HandResult {
  const counts = new Map<number, number>();
  for (const card of cards) counts.set(card.rank, (counts.get(card.rank) ?? 0) + 1);
  const ranks = [...counts.keys()].sort((a, b) => b - a);
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const flush = cards.every((card) => card.suit === cards[0].suit);
  const unique = [...ranks];
  if (unique.includes(14)) unique.push(1); // A-2-3-4-5 wheel
  let straightHigh = 0;
  for (let i = 0; i <= unique.length - 5; i++) {
    if (unique[i] - unique[i + 4] === 4) {
      straightHigh = unique[i];
      break;
    }
  }

  let category: number;
  let kickers: number[];
  if (flush && straightHigh) {
    category = straightHigh === 14 ? 9 : 8;
    // A royal flush specifically requires T-J-Q-K-A, not just any A-high straight.
    if (category === 9 && !ranks.includes(10)) category = 8;
    kickers = [straightHigh];
  } else if (groups[0][1] === 4) {
    category = 7;
    kickers = [groups[0][0], groups[1][0]];
  } else if (groups[0][1] === 3 && groups[1][1] === 2) {
    category = 6;
    kickers = [groups[0][0], groups[1][0]];
  } else if (flush) {
    category = 5;
    kickers = cards.map((c) => c.rank).sort((a, b) => b - a);
  } else if (straightHigh) {
    category = 4;
    kickers = [straightHigh];
  } else if (groups[0][1] === 3) {
    category = 3;
    kickers = [groups[0][0], ...groups.slice(1).map(([rank]) => rank).sort((a, b) => b - a)];
  } else if (groups[0][1] === 2 && groups[1][1] === 2) {
    category = 2;
    kickers = [
      Math.max(groups[0][0], groups[1][0]),
      Math.min(groups[0][0], groups[1][0]),
      groups[2][0],
    ];
  } else if (groups[0][1] === 2) {
    category = 1;
    kickers = [groups[0][0], ...groups.slice(1).map(([rank]) => rank).sort((a, b) => b - a)];
  } else {
    category = 0;
    kickers = cards.map((c) => c.rank).sort((a, b) => b - a);
  }

  return { category, kickers, score: [category, ...kickers] };
}

function combinations<T>(values: T[], count: number): T[][] {
  if (count === 0) return [[]];
  if (values.length < count) return [];
  const result: T[][] = [];
  for (let i = 0; i <= values.length - count; i++) {
    for (const rest of combinations(values.slice(i + 1), count - 1)) {
      result.push([values[i], ...rest]);
    }
  }
  return result;
}

function bestOf(hands: Card[][]): HandResult {
  let best: HandResult | null = null;
  for (const cards of hands) {
    const result = scoreFive(cards);
    if (!best || compareScores(result.score, best.score) > 0) best = result;
  }
  if (!best) throw new Error('No possible five-card hands');
  return best;
}

export class PokerEngine {
  static readonly HAND_RANKINGS = {
    HIGH_CARD: 0,
    ONE_PAIR: 1,
    TWO_PAIR: 2,
    THREE_OF_A_KIND: 3,
    STRAIGHT: 4,
    FLUSH: 5,
    FULL_HOUSE: 6,
    FOUR_OF_A_KIND: 7,
    STRAIGHT_FLUSH: 8,
    ROYAL_FLUSH: 9,
  } as const;

  /** Best five out of five to seven cards (Hold'em). */
  static evaluateBestHand(cards: string[]): HandResult {
    if (cards.length < 5 || cards.length > 7) {
      throw new Error('Holdem evaluation requires 5 to 7 cards');
    }
    return bestOf(combinations(parseCards(cards), 5));
  }

  /** Best Omaha hand, using exactly two hole cards and three board cards. */
  static evaluateOmaha(holeCards: string[], boardCards: string[]): HandResult {
    if (holeCards.length !== 4 || boardCards.length !== 5) {
      throw new Error('Omaha requires 4 hole cards and 5 board cards');
    }
    const cards = parseCards([...holeCards, ...boardCards]);
    const hole = cards.slice(0, 4);
    const board = cards.slice(4);
    const hands = combinations(hole, 2).flatMap((pair) =>
      combinations(board, 3).map((triple) => [...pair, ...triple]),
    );
    return bestOf(hands);
  }

  static evaluateHand(cards: string[]): number {
    return this.evaluateBestHand(cards).category;
  }

  /** +1 if first wins, -1 if second wins, 0 for equal hand strengths. */
  static compareHands(first: HandResult, second: HandResult): number {
    return compareScores(first.score, second.score);
  }

  static isValidGame(variant: 'NLH' | 'PLO'): boolean {
    return ['NLH', 'PLO'].includes(variant);
  }

  /** Cryptographically shuffled 52-card deck. Keep shuffling on the server. */
  static shuffledDeck(): string[] {
    const ranks = '23456789TJQKA';
    const suits = 'cdhs';
    const deck: string[] = [];
    for (const suit of suits) {
      for (const rank of ranks) deck.push(rank + suit);
    }
    // Fisher-Yates with crypto.randomInt() avoids modulo bias.
    for (let index = deck.length - 1; index > 0; index--) {
      const swapWith = randomInt(index + 1);
      [deck[index], deck[swapWith]] = [deck[swapWith], deck[index]];
    }
    return deck;
  }

  static calculatePot(bets: number[]): number {
    if (!bets.every((bet) => Number.isSafeInteger(bet) && bet >= 0)) {
      throw new Error('Bets must be non-negative integer coin units');
    }
    const total = bets.reduce((sum, bet) => sum + bet, 0);
    if (!Number.isSafeInteger(total)) throw new Error('Pot exceeds safe integer range');
    return total;
  }
}

export default PokerEngine;
