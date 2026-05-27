import { Module } from '@nestjs/common';
import { BonusService } from './bonus.service';
import { BonusController } from './bonus.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [BonusService, PrismaService],
  controllers: [BonusController],
})
export class BonusModule {}
