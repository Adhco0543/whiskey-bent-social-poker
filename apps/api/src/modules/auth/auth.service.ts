import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaService } from '../../prisma/prisma.service';
import { addBonusToWallet } from '@whiskey-bent/database';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return 'scrypt$' + salt + '$' + hash.toString('hex');
}

async function verifyPassword(candidate: string, stored: string): Promise<boolean> {
  if (!stored.startsWith('scrypt$')) {
    // Legacy demo accounts used plaintext passwords; migrate after first successful login.
    const actual = Buffer.from(stored);
    const given = Buffer.from(candidate);
    return actual.length === given.length && timingSafeEqual(actual, given);
  }
  const pieces = stored.split('$');
  if (pieces.length !== 3 || !/^[a-f0-9]{32}$/.test(pieces[1]) || !/^[a-f0-9]{128}$/.test(pieces[2])) {
    return false;
  }
  const actual = Buffer.from(pieces[2], 'hex');
  const given = (await scryptAsync(candidate, pieces[1], 64)) as Buffer;
  return timingSafeEqual(actual, given);
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(email: string, username: string, password: string) {
    email = email.trim().toLowerCase();
    username = username.trim();
    const encryptedPassword = await hashPassword(password);
    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: { email, username, password: encryptedPassword },
        });
        await addBonusToWallet(tx, created.id, 5, 'SC', 'signup');
        return created;
      });
      const token = this.jwtService.sign({ sub: user.id, email: user.email });
      return {
        user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt },
        token,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Email or username already registered');
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user || !(await verifyPassword(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Upgrade existing demo plaintext passwords without exposing them in API responses.
    const update = user.password.startsWith('scrypt$')
      ? { lastLoginAt: new Date() }
      : { password: await hashPassword(password), lastLoginAt: new Date() };
    await this.prisma.user.update({ where: { id: user.id }, data: update });

    // UTC day prevents server-local timezone from changing daily bonus boundaries.
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    await this.prisma.dailyLogin.upsert({
      where: { userId_loginDate: { userId: user.id, loginDate: today } },
      update: {},
      create: { userId: user.id, loginDate: today },
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return {
      user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt },
      token,
    };
  }
}
