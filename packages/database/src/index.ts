// Database utility functions
export * from '@prisma/client';

export async function getUserWithWallet(prisma: any, userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
      wallet: true,
    },
  });
}

/**
 * Call from an existing Prisma transaction for exactly-once bonus crediting.
 * Do not call this outside a transaction when the bonus is redeemable.
 */
export async function addBonusToWallet(
  prisma: any,
  userId: string,
  amount: number,
  currency: 'GC' | 'SC',
  bonusType: 'signup' | 'daily_login'
) {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('Bonus amount must be a positive integer');
  }
  const bonus = await prisma.bonusRecord.create({
    data: { userId, type: bonusType, amount, currency },
  });
  const coinKey = currency === 'GC' ? 'goldCoins' : 'sweepCoins';
  const wallet = await prisma.wallet.upsert({
    where: { userId },
    update: {
      [coinKey]: { increment: amount },
      totalEarned: { increment: amount },
    },
    create: {
      userId,
      [coinKey]: amount,
      totalEarned: amount,
    },
  });
  return { bonus, wallet };
}

export async function canClaimDailyBonus(prisma: any, userId: string): Promise<boolean> {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const login = await prisma.dailyLogin.findUnique({
    where: { userId_loginDate: { userId, loginDate: today } },
  });
  return !login?.claimedBonus;
}
