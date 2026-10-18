import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { addBonusToWallet, canClaimDailyBonus } from '@whiskey-bent/database';

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

      return addBonusToWallet(tx, userId, 5, 'SC', 'daily_login');
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
    return canClaimDailyBonus(this.prisma, userId);
  }
}
