import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { addBonusToWallet, canClaimDailyBonus } from '@whiskey-bent/database';

@Injectable()
export class BonusService {
  constructor(private prisma: PrismaService) {}

  async claimDailyBonus(userId: string) {
    // Check if user can claim bonus
    const canClaim = await canClaimDailyBonus(this.prisma, userId);
    if (!canClaim) {
      throw new Error('Daily bonus already claimed');
    }

    // Award 5 Sweep Coins
    const result = await addBonusToWallet(this.prisma, userId, 5, 'SC', 'daily_login');

    // Mark bonus as claimed for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await this.prisma.dailyLogin.upsert({
      where: { userId_loginDate: { userId, loginDate: today } },
      update: { claimedBonus: true },
      create: {
        userId,
        loginDate: today,
        claimedBonus: true,
      },
    });

    return result;
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
