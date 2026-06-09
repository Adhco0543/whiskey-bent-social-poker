import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { addBonusToWallet } from '@whiskey-bent/database';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(email: string, username: string, password: string) {
    // Hash password with bcrypt (salt rounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    // Award sign-up bonus: 5 Sweep Coins
    await addBonusToWallet(this.prisma, user.id, 5, 'SC', 'signup');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user: { ...user, password: undefined }, token };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare password hash using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
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
    return { user: { ...user, password: undefined }, token };
  }
}
