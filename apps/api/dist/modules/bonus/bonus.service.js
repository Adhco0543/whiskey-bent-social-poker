"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonusService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const database_1 = require("../../../../../packages/database/src");
let BonusService = class BonusService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async claimDailyBonus(userId) {
        // Check if user can claim bonus
        const canClaim = await (0, database_1.canClaimDailyBonus)(this.prisma, userId);
        if (!canClaim) {
            throw new Error('Daily bonus already claimed');
        }
        // Award 5 Sweep Coins
        const result = await (0, database_1.addBonusToWallet)(this.prisma, userId, 5, 'SC', 'daily_login');
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
    async getBonusHistory(userId, limit = 10) {
        return this.prisma.bonusRecord.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async canClaimDailyBonus(userId) {
        return (0, database_1.canClaimDailyBonus)(this.prisma, userId);
    }
};
exports.BonusService = BonusService;
exports.BonusService = BonusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BonusService);
