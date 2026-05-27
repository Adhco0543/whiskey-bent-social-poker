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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonusController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const bonus_service_1 = require("./bonus.service");
let BonusController = class BonusController {
    constructor(bonusService) {
        this.bonusService = bonusService;
    }
    async claimDailyBonus(req) {
        return this.bonusService.claimDailyBonus(req.user.userId);
    }
    async canClaimDailyBonus(req) {
        const canClaim = await this.bonusService.canClaimDailyBonus(req.user.userId);
        return { canClaim };
    }
    async getBonusHistory(req) {
        return this.bonusService.getBonusHistory(req.user.userId);
    }
};
exports.BonusController = BonusController;
__decorate([
    (0, common_1.Post)('daily-login'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BonusController.prototype, "claimDailyBonus", null);
__decorate([
    (0, common_1.Get)('can-claim'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BonusController.prototype, "canClaimDailyBonus", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BonusController.prototype, "getBonusHistory", null);
exports.BonusController = BonusController = __decorate([
    (0, common_1.Controller)('bonus'),
    __metadata("design:paramtypes", [bonus_service_1.BonusService])
], BonusController);
