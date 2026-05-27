import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Get('wallet')
  @UseGuards(AuthGuard('jwt'))
  async getWallet(@Request() req: any) {
    return this.usersService.getWallet(req.user.userId);
  }
}
