import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GameState } from '@whiskey-bent/poker-core';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GamesService {
  private activeSessions = new Map<string, GameState>();

  constructor(private prisma: PrismaService) {}

  async createGame(userId: string, variant: 'NLH' | '5CS'): Promise<string> {
    const gameId = uuidv4();
    const gameState = new GameState(gameId, variant, new Date());
    gameState.addPlayer(userId);

    this.activeSessions.set(gameId, gameState);

    // Persist to DB
    await this.prisma.gameSession.create({
      data: {
        id: gameId,
        userId,
        variant,
        tableName: `Table-${gameId.slice(0, 8)}`,
        smallBlind: 10,
        bigBlind: 20,
        maxPlayers: 1,
        buyIn: 1000,
        status: 'active',
      },
    });

    return gameId;
  }

  async joinGame(gameId: string, userId: string): Promise<GameState> {
    let gameState = this.activeSessions.get(gameId);

    if (!gameState) {
      // Reload from DB if not in memory
      const session = await this.prisma.gameSession.findUnique({ where: { id: gameId } });
      if (!session) throw new Error('Game not found');

      gameState = new GameState(gameId, session.variant as 'NLH' | '5CS', session.createdAt);
      this.activeSessions.set(gameId, gameState);
    }

    gameState.addPlayer(userId);
    return gameState;
  }

  getGameState(gameId: string): GameState {
    const state = this.activeSessions.get(gameId);
    if (!state) throw new Error('Game not found');
    return state;
  }

  async listActiveGames(): Promise<any[]> {
    return this.prisma.gameSession.findMany({
      where: { status: 'active' },
      select: { id: true, variant: true, tableName: true, maxPlayers: true },
    });
  }

  async endGame(gameId: string): Promise<void> {
    const gameState = this.activeSessions.get(gameId);
    if (gameState) {
      gameState.endGame();
    }

    await this.prisma.gameSession.update({
      where: { id: gameId },
      data: { status: 'completed', endedAt: new Date() },
    });
  }
}
