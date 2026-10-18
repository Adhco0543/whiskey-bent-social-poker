import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BonusService {
  constructor(private prisma: PrismaService) {}

  async claimDailyBonus(userId: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    return this.prisma.$transaction(async (tx) => {
      await tx.dailyLogin.upsert({
        where: { userId_loginDate: { userId, loginDate: today } },
        update: {},
        create: { userId, loginDate: today },
      });

      const claim = await tx.dailyLogin.updateMany({
        where: { userId, loginDate: today, claimedBonus: false },
        data: { claimedBonus: true },
      });

      if (claim.count !== 1) {
        throw new ConflictException('Daily bonus already claimed');
      }

      const bonus = await tx.bonusRecord.create({
        data: { userId, type: 'daily_login', amount: 5, currency: 'SC' },
      });
      const wallet = await tx.wallet.upsert({
        where: { userId },
        update: { sweepCoins: { increment: 5 }, totalEarned: { increment: 5 } },
        create: { userId, sweepCoins: 5, totalEarned: 5 },
      });
      return { bonus, wallet };
    });
  }

  async getBonusHistory(userId: string, limit = 10) {
    return this.prisma.bonusRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async canClaimDailyBonus(userId: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const record = await this.prisma.dailyLogin.findUnique({
      where: { userId_loginDate: { userId, loginDate: today } },
    });
    return !record?.claimedBonus;
  }
}
