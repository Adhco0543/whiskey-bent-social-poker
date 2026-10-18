import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, encoded] = parts;
  if (!/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(encoded)) return false;
  const expected = Buffer.from(encoded, 'hex');
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return timingSafeEqual(expected, actual);
}

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
    if (!email || !username || !password || password.length < 12) {
      throw new UnauthorizedException('Valid email, username, and a password of at least 12 characters are required');
    }
    const existing = await this.prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) throw new ConflictException('Email or username is already registered');
    const passwordHash = await hashPassword(password);
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: passwordHash,
      },
    });

    // Award sign-up bonus: 5 Sweep Coins
    await addBonusToWallet(this.prisma, user.id, 5, 'SC', 'signup');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    const { password: _password, ...safeUser } = user;
    return { user: safeUser, token };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
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
