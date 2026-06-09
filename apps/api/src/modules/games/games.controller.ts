import { Controller, Post, Get, Body, Param, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamePlayService } from './game-play.service';

@Controller('games')
export class GamesController {
  constructor(
    private gamesService: GamesService,
    private gamePlayService: GamePlayService,
  ) {}

  @Post('create')
  async createGame(
    @Body() body: { variant: 'NLH' | '5CS' },
    @Headers('authorization') auth: string,
  ) {
    const userId = this.extractUserIdFromToken(auth);
    const gameId = await this.gamesService.createGame(userId, body.variant);
    return { gameId, message: `Game ${gameId} created` };
  }

  @Post(':gameId/join')
  async joinGame(@Param('gameId') gameId: string, @Headers('authorization') auth: string) {
    const userId = this.extractUserIdFromToken(auth);
    const gameState = await this.gamesService.joinGame(gameId, userId);
    return gameState.toSnapshot();
  }

  @Get(':gameId/state')
  getGameState(@Param('gameId') gameId: string) {
    const gameState = this.gamesService.getGameState(gameId);
    return gameState.toSnapshot();
  }

  @Post(':gameId/start')
  async startGame(@Param('gameId') gameId: string, @Headers('authorization') auth: string) {
    const gameState = this.gamesService.getGameState(gameId);
    const players = Array.from(gameState['players'].keys()) || [];

    if (players.length === 0) {
      throw new HttpException('No players in game', HttpStatus.BAD_REQUEST);
    }

    this.gamePlayService.dealHands(gameState, players);
    return { message: 'Hands dealt', gameState: gameState.toSnapshot() };
  }

  @Post(':gameId/action')
  async playerAction(
    @Param('gameId') gameId: string,
    @Body() body: { action: 'bet' | 'fold' | 'check'; amount?: number },
    @Headers('authorization') auth: string,
  ) {
    const userId = this.extractUserIdFromToken(auth);
    const gameState = this.gamesService.getGameState(gameId);

    if (body.action === 'bet' && body.amount) {
      gameState['playerBet'](userId, body.amount);
    } else if (body.action === 'fold') {
      gameState['playerFold'](userId);
    }

    return { message: `Action '${body.action}' recorded`, gameState: gameState.toSnapshot() };
  }

  @Get('list')
  async listGames() {
    const games = await this.gamesService.listActiveGames();
    return games;
  }

  @Post(':gameId/end')
  async endGame(@Param('gameId') gameId: string) {
    await this.gamesService.endGame(gameId);
    return { message: `Game ${gameId} ended` };
  }

  private extractUserIdFromToken(auth: string): string {
    if (!auth) throw new HttpException('No authorization header', HttpStatus.UNAUTHORIZED);
    // Simplified: in production, use JWT verification
    const token = auth.replace('Bearer ', '');
    return 'user-from-token'; // Placeholder
  }
}
