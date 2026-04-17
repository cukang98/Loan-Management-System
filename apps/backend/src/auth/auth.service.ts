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
    this.logger.log(`Login attempt for ${dto.email}`);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        userGroup: { include: { permissions: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('REFRESH_TOKEN_SECRET'),
      expiresIn: this.config.get('REFRESH_TOKEN_EXPIRES_IN'),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refreshToken.create({
      data: { token: hashedRefresh, userId: user.id, expiresAt },
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/auth',
    });

    this.logger.log(`Login successful for ${user.email}`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        userGroup: user.userGroup,
      },
    };
  }

  async refresh(refreshToken: string, res: Response) {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        expiresAt: { gt: new Date() },
      },
    });

    let validToken = false;
    for (const stored of storedTokens) {
      if (await bcrypt.compare(refreshToken, stored.token)) {
        validToken = true;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedException('Refresh token not found or expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { userGroup: { include: { permissions: true } } },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const newAccessToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      },
    );

    return {
      accessToken: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        userGroup: user.userGroup,
      },
    };
  }

  async logout(userId: string, refreshToken: string | undefined, res: Response) {
    if (refreshToken) {
      const storedTokens = await this.prisma.refreshToken.findMany({
        where: { userId },
      });

      for (const stored of storedTokens) {
        if (await bcrypt.compare(refreshToken, stored.token)) {
          await this.prisma.refreshToken.delete({ where: { id: stored.id } });
          break;
        }
      }
    }

    res.clearCookie('refresh_token', { path: '/auth' });
    this.logger.log(`User ${userId} logged out`);
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        userGroup: {
          include: { permissions: true },
        },
      },
    });
  }
}
