import { Card } from './card';

export enum HandRank {
  HIGH_CARD = 0,
  ONE_PAIR = 1,
  TWO_PAIR = 2,
  THREE_OF_A_KIND = 3,
  STRAIGHT = 4,
  FLUSH = 5,
  FULL_HOUSE = 6,
  FOUR_OF_A_KIND = 7,
  STRAIGHT_FLUSH = 8,
  ROYAL_FLUSH = 9,
}

export interface Hand {
  rank: HandRank;
  cards: Card[];
  kickers: Card[];
  description: string;
}

export class HandEvaluator {
  static evaluate(cards: Card[]): Hand {
    if (cards.length < 5) {
      throw new Error('Hand must contain at least 5 cards');
    }

    // Sort by rank value descending
    const sorted = [...cards].sort((a, b) => b.getRankValue() - a.getRankValue());

    // Check for each hand type in order of value
    const royalFlush = this.checkRoyalFlush(sorted);
    if (royalFlush) return royalFlush;

    const straightFlush = this.checkStraightFlush(sorted);
    if (straightFlush) return straightFlush;

    const fourOfAKind = this.checkFourOfAKind(sorted);
    if (fourOfAKind) return fourOfAKind;

    const fullHouse = this.checkFullHouse(sorted);
    if (fullHouse) return fullHouse;

    const flush = this.checkFlush(sorted);
    if (flush) return flush;

    const straight = this.checkStraight(sorted);
    if (straight) return straight;

    const threeOfAKind = this.checkThreeOfAKind(sorted);
    if (threeOfAKind) return threeOfAKind;

    const twoPair = this.checkTwoPair(sorted);
    if (twoPair) return twoPair;

    const onePair = this.checkOnePair(sorted);
    if (onePair) return onePair;

    return this.highCard(sorted);
  }

  private static checkRoyalFlush(cards: Card[]): Hand | null {
    // Royal flush is A-K-Q-J-10 of same suit
    const flush = this.findFlush(cards);
    if (!flush) return null;

    const sorted = flush.sort((a, b) => b.getRankValue() - a.getRankValue());
    if (sorted[0].rank === 'A' && sorted[1].rank === 'K' && sorted[2].rank === 'Q' && sorted[3].rank === 'J' && sorted[4].rank === '10') {
      return {
        rank: HandRank.ROYAL_FLUSH,
        cards: sorted.slice(0, 5),
        kickers: [],
        description: 'Royal Flush',
      };
    }

    return null;
  }

  private static checkStraightFlush(cards: Card[]): Hand | null {
    const flush = this.findFlush(cards);
    if (!flush) return null;

    return this.checkStraightInternal(flush);
  }

  private static checkFourOfAKind(cards: Card[]): Hand | null {
    const groups = this.groupByRank(cards);
    for (const [rank, group] of groups.entries()) {
      if (group.length === 4) {
        const kickers = cards.filter((c) => c.rank !== rank).sort((a, b) => b.getRankValue() - a.getRankValue());
        return {
          rank: HandRank.FOUR_OF_A_KIND,
          cards: group,
          kickers: kickers.slice(0, 1),
          description: `Four of a Kind (${rank}s)`,
        };
      }
    }
    return null;
  }

  private static checkFullHouse(cards: Card[]): Hand | null {
    const groups = this.groupByRank(cards);
    let threeOfAKind: Card[] | null = null;
    let pair: Card[] | null = null;

    for (const group of groups.values()) {
      if (group.length === 3) threeOfAKind = group;
      if (group.length === 2) pair = group;
    }

    if (threeOfAKind && pair) {
      return {
        rank: HandRank.FULL_HOUSE,
        cards: [...threeOfAKind, ...pair],
        kickers: [],
        description: `Full House (${threeOfAKind[0].rank}s over ${pair[0].rank}s)`,
      };
    }

    return null;
  }

  private static checkFlush(cards: Card[]): Hand | null {
    const flush = this.findFlush(cards);
    if (!flush) return null;

    const sorted = flush.sort((a, b) => b.getRankValue() - a.getRankValue());
    return {
      rank: HandRank.FLUSH,
      cards: sorted.slice(0, 5),
      kickers: sorted.slice(5),
      description: `Flush (${sorted[0].suit})`,
    };
  }

  private static checkStraight(cards: Card[]): Hand | null {
    return this.checkStraightInternal(cards);
  }

  private static checkStraightInternal(cards: Card[]): Hand | null {
    const sorted = [...cards].sort((a, b) => b.getRankValue() - a.getRankValue());

    // Check for normal straight
    for (let i = 0; i < sorted.length - 4; i++) {
      if (this.isStraight(sorted.slice(i, i + 5))) {
        const straight = sorted.slice(i, i + 5);
        return {
          rank: HandRank.STRAIGHT,
          cards: straight,
          kickers: [],
          description: `Straight (${straight[0].rank}-high)`,
        };
      }
    }

    // Check for A-2-3-4-5 (wheel)
    const values = sorted.map((c) => c.getRankValue());
    if (values.includes(14) && values.includes(2) && values.includes(3) && values.includes(4) && values.includes(5)) {
      const wheel = sorted.filter((c) => [14, 2, 3, 4, 5].includes(c.getRankValue())).slice(0, 5);
      return {
        rank: HandRank.STRAIGHT,
        cards: wheel,
        kickers: [],
        description: 'Straight (5-high)',
      };
    }

    return null;
  }

  private static checkThreeOfAKind(cards: Card[]): Hand | null {
    const groups = this.groupByRank(cards);
    for (const [rank, group] of groups.entries()) {
      if (group.length === 3) {
        const kickers = cards.filter((c) => c.rank !== rank).sort((a, b) => b.getRankValue() - a.getRankValue());
        return {
          rank: HandRank.THREE_OF_A_KIND,
          cards: group,
          kickers: kickers.slice(0, 2),
          description: `Three of a Kind (${rank}s)`,
        };
      }
    }
    return null;
  }

  private static checkTwoPair(cards: Card[]): Hand | null {
    const groups = this.groupByRank(cards);
    const pairs: Card[][] = [];

    for (const group of groups.values()) {
      if (group.length === 2) {
        pairs.push(group);
      }
    }

    if (pairs.length >= 2) {
      const sorted = pairs.sort((a, b) => b[0].getRankValue() - a[0].getRankValue());
      const kickers = cards
        .filter((c) => c.rank !== sorted[0][0].rank && c.rank !== sorted[1][0].rank)
        .sort((a, b) => b.getRankValue() - a.getRankValue());
      return {
        rank: HandRank.TWO_PAIR,
        cards: [...sorted[0], ...sorted[1]],
        kickers: kickers.slice(0, 1),
        description: `Two Pair (${sorted[0][0].rank}s and ${sorted[1][0].rank}s)`,
      };
    }

    return null;
  }

  private static checkOnePair(cards: Card[]): Hand | null {
    const groups = this.groupByRank(cards);
    for (const [rank, group] of groups.entries()) {
      if (group.length === 2) {
        const kickers = cards.filter((c) => c.rank !== rank).sort((a, b) => b.getRankValue() - a.getRankValue());
        return {
          rank: HandRank.ONE_PAIR,
          cards: group,
          kickers: kickers.slice(0, 3),
          description: `Pair of ${rank}s`,
        };
      }
    }
    return null;
  }

  private static highCard(cards: Card[]): Hand {
    const sorted = [...cards].sort((a, b) => b.getRankValue() - a.getRankValue());
    return {
      rank: HandRank.HIGH_CARD,
      cards: [sorted[0]],
      kickers: sorted.slice(1, 5),
      description: `High Card (${sorted[0].rank})`,
    };
  }

  private static findFlush(cards: Card[]): Card[] | null {
    const suitGroups: Record<string, Card[]> = {};
    for (const card of cards) {
      if (!suitGroups[card.suit]) suitGroups[card.suit] = [];
      suitGroups[card.suit].push(card);
    }

    for (const cards of Object.values(suitGroups)) {
      if (cards.length >= 5) {
        return cards;
      }
    }

    return null;
  }

  private static isStraight(cards: Card[]): boolean {
    if (cards.length < 5) return false;
    for (let i = 0; i < 4; i++) {
      if (cards[i].getRankValue() - cards[i + 1].getRankValue() !== 1) {
        return false;
      }
    }
    return true;
  }

  private static groupByRank(cards: Card[]): Map<string, Card[]> {
    const groups = new Map<string, Card[]>();
    for (const card of cards) {
      if (!groups.has(card.rank)) {
        groups.set(card.rank, []);
      }
      groups.get(card.rank)!.push(card);
    }
    return groups;
  }
}
