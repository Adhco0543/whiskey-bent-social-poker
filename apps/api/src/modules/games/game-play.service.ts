import { Injectable } from '@nestjs/common';
import { Deck, Card, HandEvaluator, GameState } from '@whiskey-bent/poker-core';

@Injectable()
export class GamePlayService {
  private deck = new Deck();

  dealHands(gameState: GameState, players: string[]): void {
    this.deck.shuffle();

    // Deal 2 hole cards to each player (for NLH)
    for (const playerId of players) {
      const holeCards = this.deck.drawMany(2);
      gameState.dealHole(playerId, holeCards);
    }
  }

  dealFlop(gameState: GameState): void {
    const flopCards = this.deck.drawMany(3);
    for (const card of flopCards) {
      gameState.addCommunityCard(card);
    }
    gameState.nextRound();
  }

  dealTurn(gameState: GameState): void {
    gameState.addCommunityCard(this.deck.draw());
    gameState.nextRound();
  }

  dealRiver(gameState: GameState): void {
    gameState.addCommunityCard(this.deck.draw());
    gameState.nextRound();
  }

  evaluateWinner(gameState: GameState): Array<{ userId: string; handDescription: string; pot: number }> {
    const winners = gameState.getWinners();

    if (winners.length === 0) return [];

    // For now, single winner takes all
    const totalPot = winners.length > 0 ? 1000 : 0; // Simplified
    return [
      {
        userId: winners[0].userId,
        handDescription: winners[0].hand.description,
        pot: totalPot,
      },
    ];
  }
}
