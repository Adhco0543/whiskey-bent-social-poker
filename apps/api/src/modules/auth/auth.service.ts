import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { addBonusToWallet } from '@whiskey-bent/database';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(email: string, username: string, password: string) {
    // Simplified - in production, hash password with bcrypt
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password,
      },
    });

    // Award sign-up bonus: 5 Sweep Coins
    await addBonusToWallet(this.prisma, user.id, 5, 'SC', 'signup');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    // Record login
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.dailyLogin.upsert({
      where: { userId_loginDate: { userId: user.id, loginDate: today } },
      update: {},
      create: {
        userId: user.id,
        loginDate: today,
      },
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, token };
  }
}
