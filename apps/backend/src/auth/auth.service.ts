import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto, res: Response) {
    this.logger.log(`Login attempt for userId: ${dto.userId}`);

    const user = await this.prisma.user.findUnique({
      where: { userId: dto.userId },
      include: { userGroup: { include: { permissions: true } } },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = {
      sub: user.id,
      userId: user.userId,
      actorType: user.actorType as 'USER' | 'LENDER',
    };
    const { accessToken, refreshToken } = this.mintTokens(payload);

    await this.storeRefreshToken(refreshToken, user.id);
    this.setRefreshCookie(res, refreshToken);

    this.logger.log(`Login successful: ${user.userId} (${user.actorType})`);

    return {
      accessToken,
      user: {
        id: user.id,
        userId: user.userId,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        actorType: user.actorType,
        userGroup: user.userGroup,
      },
    };
  }

  async refresh(refreshToken: string, res: Response) {
    if (!refreshToken) throw new UnauthorizedException('Invalid refresh token');

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub, expiresAt: { gt: new Date() } },
    });

    const valid = await this.verifyHashedToken(refreshToken, storedTokens);
    if (!valid) throw new UnauthorizedException('Refresh token not found or expired');

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { userGroup: { include: { permissions: true } } },
    });
    if (!user || !user.isActive) throw new UnauthorizedException('User not found or inactive');

    const newAccessToken = this.jwtService.sign(
      { sub: user.id, userId: user.userId, actorType: user.actorType as 'USER' | 'LENDER' } satisfies JwtPayload,
      { secret: this.config.get('JWT_SECRET'), expiresIn: this.config.get('JWT_EXPIRES_IN') },
    );

    return {
      accessToken: newAccessToken,
      user: {
        id: user.id,
        userId: user.userId,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        actorType: user.actorType,
        userGroup: user.userGroup,
      },
    };
  }

  async logout(actorId: string, refreshToken: string | undefined, res: Response) {
    if (refreshToken) {
      const stored = await this.prisma.refreshToken.findMany({ where: { userId: actorId } });
      for (const s of stored) {
        if (await bcrypt.compare(refreshToken, s.token)) {
          await this.prisma.refreshToken.delete({ where: { id: s.id } });
          break;
        }
      }
    }

    res.clearCookie('refresh_token', { path: '/auth' });
    this.logger.log(`User ${actorId} logged out`);
  }

  async getMe(actorId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        isActive: true,
        actorType: true,
        userGroup: { include: { permissions: true } },
      },
    });
    return user;
  }

  // ─── helpers ──────────────────────────────────────────────────────────────

  private mintTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('REFRESH_TOKEN_SECRET'),
      expiresIn: this.config.get('REFRESH_TOKEN_EXPIRES_IN'),
    });
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(token: string, userId: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    const hashed = await bcrypt.hash(token, 10);
    await this.prisma.refreshToken.create({
      data: { token: hashed, userId, expiresAt },
    });
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/auth',
    });
  }

  private async verifyHashedToken(raw: string, stored: { token: string }[]) {
    for (const s of stored) {
      if (await bcrypt.compare(raw, s.token)) return true;
    }
    return false;
  }
}
