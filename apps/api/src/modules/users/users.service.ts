import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        lastLoginAt: true,
        wallet: true,
      },
    });
  }

  async getWallet(userId: string) {
    return this.prisma.wallet.findUnique({
      where: { userId },
    });
  }
}
