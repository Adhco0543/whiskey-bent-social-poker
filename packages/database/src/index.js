"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserWithWallet = getUserWithWallet;
exports.addBonusToWallet = addBonusToWallet;
exports.canClaimDailyBonus = canClaimDailyBonus;
// Database utility functions
__exportStar(require("@prisma/client"), exports);
async function getUserWithWallet(prisma, userId) {
    return prisma.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
    });
}
async function addBonusToWallet(prisma, userId, amount, currency, bonusType) {
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
    const updateData = {};
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
async function canClaimDailyBonus(prisma, userId) {
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
