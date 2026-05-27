import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BonusService } from './bonus.service';

@Controller('bonus')
export class BonusController {
  constructor(private bonusService: BonusService) {}

  @Post('daily-login')
  @UseGuards(AuthGuard('jwt'))
  async claimDailyBonus(@Request() req: any) {
    return this.bonusService.claimDailyBonus(req.user.userId);
  }

  @Get('can-claim')
  @UseGuards(AuthGuard('jwt'))
  async canClaimDailyBonus(@Request() req: any) {
    const canClaim = await this.bonusService.canClaimDailyBonus(req.user.userId);
    return { canClaim };
  }

  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  async getBonusHistory(@Request() req: any) {
    return this.bonusService.getBonusHistory(req.user.userId);
  }
}
