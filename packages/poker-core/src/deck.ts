import { Card, Suit, Rank } from './card';

export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.reset();
  }

  private reset(): void {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Rank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

    this.cards = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push(new Card(suit, rank));
      }
    }
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(): Card {
    const card = this.cards.pop();
    if (!card) {
      this.reset();
      this.shuffle();
      return this.cards.pop()!;
    }
    return card;
  }

  drawMany(count: number): Card[] {
    return Array.from({ length: count }, () => this.draw());
  }

  remaining(): number {
    return this.cards.length;
  }
}
