import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamePlayService } from './game-play.service';
import { GamesController } from './games.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [GamesController],
  providers: [GamesService, GamePlayService, PrismaService],
  exports: [GamesService],
})
export class GamesModule {}
