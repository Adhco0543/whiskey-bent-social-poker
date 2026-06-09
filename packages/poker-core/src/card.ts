export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

export class Card {
  constructor(
    public suit: Suit,
    public rank: Rank,
  ) {}

  static fromString(str: string): Card {
    const suit = str[0] as Suit;
    const rank = str.slice(1) as Rank;
    return new Card(suit, rank);
  }

  toString(): string {
    return `${this.suit[0]}${this.rank}`;
  }

  getRankValue(): number {
    const rankValues: Record<Rank, number> = {
      'A': 14,
      'K': 13,
      'Q': 12,
      'J': 11,
      '10': 10,
      '9': 9,
      '8': 8,
      '7': 7,
      '6': 6,
      '5': 5,
      '4': 4,
      '3': 3,
      '2': 2,
    };
    return rankValues[this.rank];
  }
}
