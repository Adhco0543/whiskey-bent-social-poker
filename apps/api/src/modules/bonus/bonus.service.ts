import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const DAY_MS = 24 * 60 * 60 * 1000;
const CYCLE_DAYS = 30;

function utcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function rewardForDay(day: number): number {
  if (day === CYCLE_DAYS) return 5;
  const zeroBased = day - 1;
  const cents = 10 + (zeroBased % 7) * 5 + Math.floor(zeroBased / 7) * 5;
  return cents / 100;
}

@Injectable()
export class BonusService {
  constructor(private prisma: PrismaService) {}

  private async progress(userId: string, today: Date) {
    const recent = await this.prisma.dailyLogin.findMany({
      where: { userId, claimedBonus: true, loginDate: { lt: today } },
      orderBy: { loginDate: 'desc' },
      take: CYCLE_DAYS,
      select: { loginDate: true },
    });
    let consecutive = 0;
    for (const row of recent) {
      const expected = today.getTime() - (consecutive + 1) * DAY_MS;
      if (utcDay(row.loginDate).getTime() !== expected) break;
      consecutive++;
    }
    const day = (consecutive % CYCLE_DAYS) + 1;
    return { day, amount: rewardForDay(day), consecutive };
  }

  async claimDailyBonus(userId: string) {
    const today = utcDay(new Date());

    return this.prisma.$transaction(async (tx) => {
      // A conditional update is the atomic guard against concurrent double claims.
      await tx.dailyLogin.upsert({
        where: { userId_loginDate: { userId, loginDate: today } },
        update: {},
        create: { userId, loginDate: today },
      });
      const claim = await tx.dailyLogin.updateMany({
        where: { userId, loginDate: today, claimedBonus: false },
        data: { claimedBonus: true },
      });
      if (claim.count !== 1) throw new ConflictException('Daily bonus already claimed');

      const recent = await tx.dailyLogin.findMany({
        where: { userId, claimedBonus: true, loginDate: { lt: today } },
        orderBy: { loginDate: 'desc' },
        take: CYCLE_DAYS,
        select: { loginDate: true },
      });
      let consecutive = 0;
      for (const row of recent) {
        if (utcDay(row.loginDate).getTime() !== today.getTime() - (consecutive + 1) * DAY_MS) break;
        consecutive++;
      }
      const day = (consecutive % CYCLE_DAYS) + 1;
      const amount = rewardForDay(day);
      const bonus = await tx.bonusRecord.create({
        data: { userId, type: day === CYCLE_DAYS ? 'monthly_login_prize' : 'daily_login', amount, currency: 'SC' },
      });
      const wallet = await tx.wallet.upsert({
        where: { userId },
        update: { sweepCoins: { increment: amount }, totalEarned: { increment: amount } },
        create: { userId, sweepCoins: amount, totalEarned: amount },
      });
      return { bonus, wallet, day, amount, cycleDays: CYCLE_DAYS, nextDay: day === CYCLE_DAYS ? 1 : day + 1 };
    });
  }

  async getBonusHistory(userId: string, limit = 10) {
    return this.prisma.bonusRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getDailyRewardStatus(userId: string) {
    const today = utcDay(new Date());
    const [claimed, progress] = await Promise.all([
      this.prisma.dailyLogin.findUnique({ where: { userId_loginDate: { userId, loginDate: today } } }),
      this.progress(userId, today),
    ]);
    const alreadyClaimed = Boolean(claimed?.claimedBonus);
    return {
      canClaim: !alreadyClaimed,
      day: alreadyClaimed ? (progress.day === 1 ? CYCLE_DAYS : progress.day - 1) : progress.day,
      nextReward: progress.amount,
      cycleDays: CYCLE_DAYS,
      monthlyPrize: 5,
      timezone: 'UTC',
    };
  }

  async canClaimDailyBonus(userId: string) {
    return (await this.getDailyRewardStatus(userId)).canClaim;
  }
}
