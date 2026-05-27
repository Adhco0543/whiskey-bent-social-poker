// Database utility functions
export * from '@prisma/client';

export async function getUserWithWallet(prisma: any, userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });
}

export async function addBonusToWallet(
  prisma: any,
  userId: string,
  amount: number,
  currency: 'GC' | 'SC',
  bonusType: 'signup' | 'daily_login'
) {
  // Record the bonus
  const bonus = await prisma.bonusRecord.create({
    data: {
      userId,
      type: bonusType,
      amount,
      currency,
    },
  });

  // Update wallet
  const updateData: any = {};
  updateData[currency === 'GC' ? 'goldCoins' : 'sweepCoins'] = {
    increment: amount,
  };
  updateData.totalEarned = {
    increment: amount,
  };

  const wallet = await prisma.wallet.upsert({
    where: { userId },
    update: updateData,
    create: {
      userId,
      ...(currency === 'GC' ? { goldCoins: amount } : { sweepCoins: amount }),
      totalEarned: amount,
    },
  });

  return { bonus, wallet };
}

export async function canClaimDailyBonus(prisma: any, userId: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const loginToday = await prisma.dailyLogin.findFirst({
    where: {
      userId,
      loginDate: {
        gte: today,
      },
    },
  });

  return !loginToday || !loginToday.claimedBonus;
}
