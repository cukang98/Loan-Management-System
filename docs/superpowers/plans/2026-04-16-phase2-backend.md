# Loan System — Phase 2: Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all NestJS API modules (Auth, Users, User Groups/RBAC, Lenders, Customers, Loans, Repayments, Dashboard) producing a fully tested REST API running at `http://localhost:3001`.

**Architecture:** Controller → Service pattern per module. Business logic in services only. Controllers are thin request/response wrappers. RBAC enforced via `PermissionGuard` + `@RequirePermission()` decorator. `LoanCalculatorService` is a pure calculation class — isolated and independently testable.

**Prerequisites:** Phase 1 complete. Postgres running. NestJS bootstrapped. Prisma schema migrated and seeded.

**Tech Stack:** NestJS 10, Passport.js, @nestjs/jwt, bcryptjs, class-validator, Prisma 5

---

## File Map

| File | Purpose |
|---|---|
| `src/auth/dto/login.dto.ts` | Login request validation |
| `src/auth/strategies/jwt.strategy.ts` | Validates JWT, attaches user to request |
| `src/auth/guards/jwt-auth.guard.ts` | Applies JWT strategy to routes |
| `src/auth/guards/permission.guard.ts` | Checks user group permissions |
| `src/auth/decorators/require-permission.decorator.ts` | `@RequirePermission(module, action)` |
| `src/auth/auth.service.ts` | Login, logout, refresh token logic |
| `src/auth/auth.controller.ts` | `/auth/*` endpoints |
| `src/auth/auth.module.ts` | Auth module wiring |
| `src/users/dto/create-user.dto.ts` | Create user validation |
| `src/users/dto/update-user.dto.ts` | Update user validation |
| `src/users/users.service.ts` | User CRUD |
| `src/users/users.controller.ts` | `/users/*` endpoints |
| `src/users/users.module.ts` | Users module |
| `src/user-groups/dto/create-user-group.dto.ts` | Create group + permissions |
| `src/user-groups/dto/update-user-group.dto.ts` | Update group |
| `src/user-groups/user-groups.service.ts` | Group CRUD, permission management |
| `src/user-groups/user-groups.controller.ts` | `/user-groups/*` endpoints |
| `src/user-groups/user-groups.module.ts` | User groups module |
| `src/lenders/dto/create-lender.dto.ts` | Lender validation |
| `src/lenders/dto/update-lender.dto.ts` | Lender update |
| `src/lenders/lenders.service.ts` | Lender CRUD |
| `src/lenders/lenders.controller.ts` | `/lenders/*` endpoints |
| `src/lenders/lenders.module.ts` | Lenders module |
| `src/customers/dto/create-customer.dto.ts` | Customer validation |
| `src/customers/dto/update-customer.dto.ts` | Customer update |
| `src/customers/customers.service.ts` | Customer CRUD |
| `src/customers/customers.controller.ts` | `/customers/*` endpoints |
| `src/customers/customers.module.ts` | Customers module |
| `src/loans/loan-calculator.service.ts` | Pure calculation: flat rate + reducing balance |
| `src/loans/loan-calculator.service.spec.ts` | Unit tests for calculations |
| `src/loans/dto/create-loan.dto.ts` | Loan creation validation |
| `src/loans/dto/update-loan.dto.ts` | Status update |
| `src/loans/loans.service.ts` | Loan CRUD + calculation integration |
| `src/loans/loans.controller.ts` | `/loans/*` endpoints |
| `src/loans/loans.module.ts` | Loans module |
| `src/repayments/dto/create-repayment.dto.ts` | Repayment validation |
| `src/repayments/repayments.service.ts` | Record repayments, balance tracking |
| `src/repayments/repayments.controller.ts` | `/repayments/*` endpoints |
| `src/repayments/repayments.module.ts` | Repayments module |
| `src/dashboard/dashboard.service.ts` | KPI aggregations + chart queries |
| `src/dashboard/dashboard.controller.ts` | `/dashboard/*` endpoints |
| `src/dashboard/dashboard.module.ts` | Dashboard module |
| `src/app.module.ts` | Updated: imports all modules |

---

## Task 7: Auth Module — JWT Strategy & Guards

**Files:**
- Create: `apps/backend/src/auth/dto/login.dto.ts`
- Create: `apps/backend/src/auth/decorators/require-permission.decorator.ts`
- Create: `apps/backend/src/auth/strategies/jwt.strategy.ts`
- Create: `apps/backend/src/auth/guards/jwt-auth.guard.ts`
- Create: `apps/backend/src/auth/guards/permission.guard.ts`

- [ ] **Step 1: Create apps/backend/src/auth/dto/login.dto.ts**

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

- [ ] **Step 2: Create apps/backend/src/auth/decorators/require-permission.decorator.ts**

```typescript
import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

export interface RequiredPermission {
  module: string;
  action: string;
}

export const RequirePermission = (module: string, action: string) =>
  SetMetadata(PERMISSION_KEY, { module, action });
```

- [ ] **Step 3: Create apps/backend/src/auth/strategies/jwt.strategy.ts**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userGroup: {
          include: { permissions: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
```

- [ ] **Step 4: Create apps/backend/src/auth/guards/jwt-auth.guard.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

- [ ] **Step 5: Create apps/backend/src/auth/guards/permission.guard.ts**

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, RequiredPermission } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Route has no permission requirement — allow through
    if (!required) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    // Super admins bypass all permission checks
    if (user.userGroup?.isSuperAdmin) return true;

    const hasPermission = user.userGroup?.permissions?.some(
      (p: { module: string; action: string }) =>
        p.module === required.module && p.action === required.action,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Permission denied: requires ${required.module}:${required.action}`,
      );
    }

    return true;
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/auth/
git commit -m "feat: add JWT strategy, guards, and permission decorator"
```

---

## Task 8: Auth Service & Controller

**Files:**
- Create: `apps/backend/src/auth/auth.service.ts`
- Create: `apps/backend/src/auth/auth.controller.ts`
- Create: `apps/backend/src/auth/auth.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create apps/backend/src/auth/auth.service.ts**

```typescript
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

    // Store hashed refresh token
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refreshToken.create({
      data: { token: hashedRefresh, userId: user.id, expiresAt },
    });

    // Set refresh token in HTTP-only cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/auth',
    });

    this.logger.log(`Login successful for ${user.email}`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
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

    // Find matching refresh token records for user
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
        userGroup: user.userGroup,
      },
    };
  }

  async logout(userId: string, refreshToken: string | undefined, res: Response) {
    if (refreshToken) {
      // Remove the specific refresh token
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
        userGroup: {
          include: { permissions: true },
        },
      },
    });
  }
}
```

- [ ] **Step 2: Create apps/backend/src/auth/auth.controller.ts**

```typescript
import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, res);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    return this.authService.refresh(refreshToken, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request & { user: any },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    await this.authService.logout(req.user.id, refreshToken, res);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request & { user: any }) {
    return this.authService.getMe(req.user.id);
  }
}
```

- [ ] **Step 3: Create apps/backend/src/auth/auth.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

- [ ] **Step 4: Update apps/backend/src/app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 5: Start the backend and test login**

```bash
docker-compose up backend -d
```

```bash
curl -c cookies.txt -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@loanapp.com","password":"Admin1234!"}' | jq .
```

Expected response:
```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt-token>",
    "user": {
      "id": "...",
      "email": "admin@loanapp.com",
      "name": "System Administrator",
      "userGroup": { "name": "Super Admin", "isSuperAdmin": true, "permissions": [] }
    }
  }
}
```

- [ ] **Step 6: Test /auth/me**

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@loanapp.com","password":"Admin1234!"}' | jq -r '.data.accessToken')

curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Expected: returns user object with userGroup.

- [ ] **Step 7: Commit**

```bash
git add apps/backend/src/auth/ apps/backend/src/app.module.ts
git commit -m "feat: implement auth module with JWT login, refresh, and logout"
```

---

## Task 9: Users Module

**Files:**
- Create: `apps/backend/src/users/dto/create-user.dto.ts`
- Create: `apps/backend/src/users/dto/update-user.dto.ts`
- Create: `apps/backend/src/users/users.service.ts`
- Create: `apps/backend/src/users/users.controller.ts`
- Create: `apps/backend/src/users/users.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create apps/backend/src/users/dto/create-user.dto.ts**

```typescript
import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  userGroupId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

- [ ] **Step 2: Create apps/backend/src/users/dto/update-user.dto.ts**

```typescript
import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  userGroupId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

- [ ] **Step 3: Create apps/backend/src/users/users.service.ts**

```typescript
import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  isActive: true,
  userGroupId: true,
  createdAt: true,
  updatedAt: true,
  userGroup: {
    select: {
      id: true,
      name: true,
      isSuperAdmin: true,
      permissions: true,
    },
  },
} as const;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    this.logger.log('Fetching all users');

    const where = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { email: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async create(dto: CreateUserDto) {
    this.logger.log(`Creating user: ${dto.email}`);

    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already in use');

    const password = await bcrypt.hash(dto.password, 12);

    return this.prisma.user.create({
      data: { ...dto, password },
      select: USER_SELECT,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    this.logger.log(`Updating user: ${id}`);
    await this.findOne(id);

    if (dto.email) {
      const exists = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (exists) throw new ConflictException('Email already in use');
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: USER_SELECT,
    });
  }

  async remove(id: string) {
    this.logger.log(`Deleting user: ${id}`);
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted' };
  }
}
```

- [ ] **Step 4: Create apps/backend/src/users/users.controller.ts**

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermission('users', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('users', 'read')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @RequirePermission('users', 'create')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('users', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('users', 'delete')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

- [ ] **Step 5: Create apps/backend/src/users/users.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 6: Add UsersModule to app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 7: Test users endpoint**

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@loanapp.com","password":"Admin1234!"}' | jq -r '.data.accessToken')

curl "http://localhost:3001/users?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.total'
```

Expected: `3` (three seeded users).

- [ ] **Step 8: Commit**

```bash
git add apps/backend/src/users/ apps/backend/src/app.module.ts
git commit -m "feat: implement users module with CRUD and RBAC guards"
```

---

## Task 10: User Groups Module (RBAC Management)

**Files:**
- Create: `apps/backend/src/user-groups/dto/create-user-group.dto.ts`
- Create: `apps/backend/src/user-groups/dto/update-user-group.dto.ts`
- Create: `apps/backend/src/user-groups/user-groups.service.ts`
- Create: `apps/backend/src/user-groups/user-groups.controller.ts`
- Create: `apps/backend/src/user-groups/user-groups.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create apps/backend/src/user-groups/dto/create-user-group.dto.ts**

```typescript
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PermissionItemDto {
  @IsString()
  @IsIn(['loans', 'customers', 'lenders', 'repayments', 'users', 'user-groups'])
  module: string;

  @IsString()
  @IsIn(['create', 'read', 'update', 'delete'])
  action: string;
}

export class CreateUserGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionItemDto)
  permissions?: PermissionItemDto[];
}
```

- [ ] **Step 2: Create apps/backend/src/user-groups/dto/update-user-group.dto.ts**

```typescript
import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionItemDto } from './create-user-group.dto';

export class UpdateUserGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionItemDto)
  permissions?: PermissionItemDto[];
}
```

- [ ] **Step 3: Create apps/backend/src/user-groups/user-groups.service.ts**

```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';

const GROUP_SELECT = {
  id: true,
  name: true,
  isSuperAdmin: true,
  permissions: true,
  createdAt: true,
  _count: { select: { users: true } },
} as const;

@Injectable()
export class UserGroupsService {
  private readonly logger = new Logger(UserGroupsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    this.logger.log('Fetching user groups');

    const where = query.search
      ? { name: { contains: query.search, mode: 'insensitive' as const } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.userGroup.findMany({
        where,
        select: GROUP_SELECT,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.userGroup.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const group = await this.prisma.userGroup.findUnique({
      where: { id },
      select: GROUP_SELECT,
    });
    if (!group) throw new NotFoundException(`User group ${id} not found`);
    return group;
  }

  async create(dto: CreateUserGroupDto) {
    this.logger.log(`Creating user group: ${dto.name}`);

    const exists = await this.prisma.userGroup.findUnique({
      where: { name: dto.name },
    });
    if (exists) throw new ConflictException('Group name already exists');

    return this.prisma.userGroup.create({
      data: {
        name: dto.name,
        isSuperAdmin: dto.isSuperAdmin ?? false,
        permissions: dto.permissions
          ? { create: dto.permissions }
          : undefined,
      },
      select: GROUP_SELECT,
    });
  }

  async update(id: string, dto: UpdateUserGroupDto) {
    this.logger.log(`Updating user group: ${id}`);
    await this.findOne(id);

    if (dto.name) {
      const exists = await this.prisma.userGroup.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (exists) throw new ConflictException('Group name already exists');
    }

    // Replace permissions atomically: delete old, create new
    return this.prisma.$transaction(async (tx) => {
      if (dto.permissions !== undefined) {
        await tx.permission.deleteMany({ where: { userGroupId: id } });
      }

      return tx.userGroup.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.isSuperAdmin !== undefined && { isSuperAdmin: dto.isSuperAdmin }),
          ...(dto.permissions !== undefined && {
            permissions: { create: dto.permissions },
          }),
        },
        select: GROUP_SELECT,
      });
    });
  }

  async remove(id: string) {
    this.logger.log(`Deleting user group: ${id}`);
    await this.findOne(id);

    const usersInGroup = await this.prisma.user.count({ where: { userGroupId: id } });
    if (usersInGroup > 0) {
      throw new ConflictException('Cannot delete group with assigned users');
    }

    await this.prisma.userGroup.delete({ where: { id } });
    return { message: 'User group deleted' };
  }
}
```

- [ ] **Step 4: Create apps/backend/src/user-groups/user-groups.controller.ts**

```typescript
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { UserGroupsService } from './user-groups.service';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('user-groups')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserGroupsController {
  constructor(private readonly userGroupsService: UserGroupsService) {}

  @Get()
  @RequirePermission('user-groups', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.userGroupsService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('user-groups', 'read')
  findOne(@Param('id') id: string) {
    return this.userGroupsService.findOne(id);
  }

  @Post()
  @RequirePermission('user-groups', 'create')
  create(@Body() dto: CreateUserGroupDto) {
    return this.userGroupsService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('user-groups', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateUserGroupDto) {
    return this.userGroupsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('user-groups', 'delete')
  remove(@Param('id') id: string) {
    return this.userGroupsService.remove(id);
  }
}
```

- [ ] **Step 5: Create apps/backend/src/user-groups/user-groups.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { UserGroupsService } from './user-groups.service';
import { UserGroupsController } from './user-groups.controller';

@Module({
  providers: [UserGroupsService],
  controllers: [UserGroupsController],
})
export class UserGroupsModule {}
```

- [ ] **Step 6: Add UserGroupsModule to app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UserGroupsModule } from './user-groups/user-groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    UserGroupsModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 7: Commit**

```bash
git add apps/backend/src/user-groups/ apps/backend/src/app.module.ts
git commit -m "feat: implement user groups module with configurable permissions"
```

---

## Task 11: Lenders Module

**Files:**
- Create: `apps/backend/src/lenders/dto/create-lender.dto.ts`
- Create: `apps/backend/src/lenders/dto/update-lender.dto.ts`
- Create: `apps/backend/src/lenders/lenders.service.ts`
- Create: `apps/backend/src/lenders/lenders.controller.ts`
- Create: `apps/backend/src/lenders/lenders.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create apps/backend/src/lenders/dto/create-lender.dto.ts**

```typescript
import { IsString, IsNumber, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLenderDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(0)
  availableCapital: number;
}
```

- [ ] **Step 2: Create apps/backend/src/lenders/dto/update-lender.dto.ts**

```typescript
import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLenderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  availableCapital?: number;
}
```

- [ ] **Step 3: Create apps/backend/src/lenders/lenders.service.ts**

```typescript
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateLenderDto } from './dto/create-lender.dto';
import { UpdateLenderDto } from './dto/update-lender.dto';

@Injectable()
export class LendersService {
  private readonly logger = new Logger(LendersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    this.logger.log('Fetching lenders');
    const where = query.search
      ? { name: { contains: query.search, mode: 'insensitive' as const } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.lender.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lender.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const lender = await this.prisma.lender.findUnique({ where: { id } });
    if (!lender) throw new NotFoundException(`Lender ${id} not found`);
    return lender;
  }

  async create(dto: CreateLenderDto) {
    this.logger.log(`Creating lender: ${dto.name}`);
    return this.prisma.lender.create({ data: dto });
  }

  async update(id: string, dto: UpdateLenderDto) {
    this.logger.log(`Updating lender: ${id}`);
    await this.findOne(id);
    return this.prisma.lender.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    this.logger.log(`Deleting lender: ${id}`);
    await this.findOne(id);
    await this.prisma.lender.delete({ where: { id } });
    return { message: 'Lender deleted' };
  }
}
```

- [ ] **Step 4: Create apps/backend/src/lenders/lenders.controller.ts**

```typescript
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { LendersService } from './lenders.service';
import { CreateLenderDto } from './dto/create-lender.dto';
import { UpdateLenderDto } from './dto/update-lender.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('lenders')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class LendersController {
  constructor(private readonly lendersService: LendersService) {}

  @Get()
  @RequirePermission('lenders', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.lendersService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('lenders', 'read')
  findOne(@Param('id') id: string) {
    return this.lendersService.findOne(id);
  }

  @Post()
  @RequirePermission('lenders', 'create')
  create(@Body() dto: CreateLenderDto) {
    return this.lendersService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('lenders', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateLenderDto) {
    return this.lendersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('lenders', 'delete')
  remove(@Param('id') id: string) {
    return this.lendersService.remove(id);
  }
}
```

- [ ] **Step 5: Create apps/backend/src/lenders/lenders.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { LendersService } from './lenders.service';
import { LendersController } from './lenders.controller';

@Module({
  providers: [LendersService],
  controllers: [LendersController],
})
export class LendersModule {}
```

- [ ] **Step 6: Add LendersModule to app.module.ts**

Add `LendersModule` to the imports array in `apps/backend/src/app.module.ts`:
```typescript
import { LendersModule } from './lenders/lenders.module';
// ... add LendersModule to imports array
```

- [ ] **Step 7: Test lenders endpoint**

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@loanapp.com","password":"Admin1234!"}' | jq -r '.data.accessToken')

curl "http://localhost:3001/lenders" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.total'
```

Expected: `3`

- [ ] **Step 8: Commit**

```bash
git add apps/backend/src/lenders/ apps/backend/src/app.module.ts
git commit -m "feat: implement lenders module"
```

---

## Task 12: Customers Module

**Files:**
- Create: `apps/backend/src/customers/dto/create-customer.dto.ts`
- Create: `apps/backend/src/customers/dto/update-customer.dto.ts`
- Create: `apps/backend/src/customers/customers.service.ts`
- Create: `apps/backend/src/customers/customers.controller.ts`
- Create: `apps/backend/src/customers/customers.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create apps/backend/src/customers/dto/create-customer.dto.ts**

```typescript
import { IsString, IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

- [ ] **Step 2: Create apps/backend/src/customers/dto/update-customer.dto.ts**

```typescript
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

- [ ] **Step 3: Create apps/backend/src/customers/customers.service.ts**

```typescript
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    this.logger.log('Fetching customers');
    const where = query.search
      ? {
          OR: [
            { fullName: { contains: query.search, mode: 'insensitive' as const } },
            { phone: { contains: query.search, mode: 'insensitive' as const } },
            { email: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { loans: true } } },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        loans: {
          select: {
            id: true, principal: true, status: true,
            startDate: true, interestRate: true, tenureMonths: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async create(dto: CreateCustomerDto) {
    this.logger.log(`Creating customer: ${dto.fullName}`);
    return this.prisma.customer.create({ data: dto });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    this.logger.log(`Updating customer: ${id}`);
    await this.findOne(id);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    this.logger.log(`Deleting customer: ${id}`);
    await this.findOne(id);
    await this.prisma.customer.delete({ where: { id } });
    return { message: 'Customer deleted' };
  }
}
```

- [ ] **Step 4: Create apps/backend/src/customers/customers.controller.ts**

```typescript
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermission('customers', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('customers', 'read')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @RequirePermission('customers', 'create')
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('customers', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('customers', 'delete')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
```

- [ ] **Step 5: Create apps/backend/src/customers/customers.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';

@Module({
  providers: [CustomersService],
  controllers: [CustomersController],
})
export class CustomersModule {}
```

- [ ] **Step 6: Add CustomersModule to app.module.ts**

Add `CustomersModule` to the imports array in `apps/backend/src/app.module.ts`:
```typescript
import { CustomersModule } from './customers/customers.module';
// ... add CustomersModule to imports array
```

- [ ] **Step 7: Commit**

```bash
git add apps/backend/src/customers/ apps/backend/src/app.module.ts
git commit -m "feat: implement customers module"
```

---

## Task 13: Loan Calculator Service (TDD)

**Files:**
- Create: `apps/backend/src/loans/loan-calculator.service.spec.ts`
- Create: `apps/backend/src/loans/loan-calculator.service.ts`

- [ ] **Step 1: Write the failing tests first**

Create `apps/backend/src/loans/loan-calculator.service.spec.ts`:

```typescript
import { LoanCalculatorService, CalculationInput } from './loan-calculator.service';
import { RepaymentFrequency, InterestModel } from '@ck-loan/shared';

describe('LoanCalculatorService', () => {
  let service: LoanCalculatorService;

  beforeEach(() => {
    service = new LoanCalculatorService();
  });

  describe('Flat Rate calculations', () => {
    const input: CalculationInput = {
      principal: 10000,
      annualInterestRate: 8,
      tenureMonths: 12,
      repaymentFrequency: RepaymentFrequency.MONTHLY,
      interestModel: InterestModel.FLAT,
    };

    it('should calculate totalRepayment correctly', () => {
      const result = service.calculate(input);
      // interest = 10000 * 0.08 * (12/12) = 800
      // total = 10000 + 800 = 10800
      expect(result.totalRepayment).toBeCloseTo(10800, 2);
    });

    it('should calculate installmentAmount correctly for MONTHLY', () => {
      const result = service.calculate(input);
      // 12 installments
      expect(result.installmentAmount).toBeCloseTo(900, 2);
    });

    it('should calculate installmentAmount correctly for WEEKLY', () => {
      const result = service.calculate({
        ...input,
        repaymentFrequency: RepaymentFrequency.WEEKLY,
      });
      // 48 installments (12 months * 4)
      expect(result.installmentAmount).toBeCloseTo(10800 / 48, 2);
    });

    it('should calculate installmentAmount correctly for BIWEEKLY', () => {
      const result = service.calculate({
        ...input,
        repaymentFrequency: RepaymentFrequency.BIWEEKLY,
      });
      // 24 installments (12 months * 2)
      expect(result.installmentAmount).toBeCloseTo(10800 / 24, 2);
    });
  });

  describe('Reducing Balance calculations', () => {
    const input: CalculationInput = {
      principal: 10000,
      annualInterestRate: 12,
      tenureMonths: 12,
      repaymentFrequency: RepaymentFrequency.MONTHLY,
      interestModel: InterestModel.REDUCING,
    };

    it('should calculate installmentAmount within expected range', () => {
      const result = service.calculate(input);
      // At 12% annual / 12 months, installment should be ~888.49
      expect(result.installmentAmount).toBeCloseTo(888.49, 0);
    });

    it('should calculate totalRepayment as installment * numInstallments', () => {
      const result = service.calculate(input);
      expect(result.totalRepayment).toBeCloseTo(result.installmentAmount * 12, 0);
    });

    it('should divide monthly installment by 4 for WEEKLY frequency', () => {
      const monthly = service.calculate(input);
      const weekly = service.calculate({
        ...input,
        repaymentFrequency: RepaymentFrequency.WEEKLY,
      });
      expect(weekly.installmentAmount).toBeCloseTo(monthly.installmentAmount / 4, 1);
    });

    it('should divide monthly installment by 2 for BIWEEKLY frequency', () => {
      const monthly = service.calculate(input);
      const biweekly = service.calculate({
        ...input,
        repaymentFrequency: RepaymentFrequency.BIWEEKLY,
      });
      expect(biweekly.installmentAmount).toBeCloseTo(monthly.installmentAmount / 2, 1);
    });
  });

  describe('getNumberOfInstallments', () => {
    it('returns tenure for MONTHLY', () => {
      expect(service.getNumberOfInstallments(12, RepaymentFrequency.MONTHLY)).toBe(12);
    });

    it('returns tenure * 4 for WEEKLY', () => {
      expect(service.getNumberOfInstallments(12, RepaymentFrequency.WEEKLY)).toBe(48);
    });

    it('returns tenure * 2 for BIWEEKLY', () => {
      expect(service.getNumberOfInstallments(12, RepaymentFrequency.BIWEEKLY)).toBe(24);
    });
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd apps/backend && npx jest src/loans/loan-calculator.service.spec.ts --no-coverage
```

Expected: `FAIL` — `Cannot find module './loan-calculator.service'`

- [ ] **Step 3: Implement apps/backend/src/loans/loan-calculator.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { RepaymentFrequency, InterestModel } from '@ck-loan/shared';

export interface CalculationInput {
  principal: number;
  annualInterestRate: number;
  tenureMonths: number;
  repaymentFrequency: RepaymentFrequency;
  interestModel: InterestModel;
}

export interface CalculationResult {
  totalRepayment: number;
  installmentAmount: number;
  numberOfInstallments: number;
}

@Injectable()
export class LoanCalculatorService {
  /**
   * Calculate loan repayment figures based on interest model.
   * Adding a new interest model: implement a private calc method
   * and add a case to the switch below.
   */
  calculate(input: CalculationInput): CalculationResult {
    switch (input.interestModel) {
      case InterestModel.FLAT:
        return this.calculateFlat(input);
      case InterestModel.REDUCING:
        return this.calculateReducing(input);
      default:
        throw new Error(`Unknown interest model: ${input.interestModel}`);
    }
  }

  getNumberOfInstallments(
    tenureMonths: number,
    frequency: RepaymentFrequency,
  ): number {
    switch (frequency) {
      case RepaymentFrequency.WEEKLY:
        return tenureMonths * 4;
      case RepaymentFrequency.BIWEEKLY:
        return tenureMonths * 2;
      case RepaymentFrequency.MONTHLY:
        return tenureMonths;
    }
  }

  private calculateFlat(input: CalculationInput): CalculationResult {
    const {
      principal,
      annualInterestRate,
      tenureMonths,
      repaymentFrequency,
    } = input;

    const totalInterest =
      principal * (annualInterestRate / 100) * (tenureMonths / 12);
    const totalRepayment = principal + totalInterest;
    const numberOfInstallments = this.getNumberOfInstallments(
      tenureMonths,
      repaymentFrequency,
    );
    const installmentAmount = totalRepayment / numberOfInstallments;

    return {
      totalRepayment: this.round(totalRepayment),
      installmentAmount: this.round(installmentAmount),
      numberOfInstallments,
    };
  }

  private calculateReducing(input: CalculationInput): CalculationResult {
    const {
      principal,
      annualInterestRate,
      tenureMonths,
      repaymentFrequency,
    } = input;

    const monthlyRate = annualInterestRate / 100 / 12;
    const monthlyInstallment =
      (principal * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -tenureMonths));

    const freqDivisor =
      repaymentFrequency === RepaymentFrequency.WEEKLY
        ? 4
        : repaymentFrequency === RepaymentFrequency.BIWEEKLY
          ? 2
          : 1;

    const installmentAmount = monthlyInstallment / freqDivisor;
    const numberOfInstallments = this.getNumberOfInstallments(
      tenureMonths,
      repaymentFrequency,
    );
    const totalRepayment = installmentAmount * numberOfInstallments;

    return {
      totalRepayment: this.round(totalRepayment),
      installmentAmount: this.round(installmentAmount),
      numberOfInstallments,
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd apps/backend && npx jest src/loans/loan-calculator.service.spec.ts --no-coverage
```

Expected:
```
PASS  src/loans/loan-calculator.service.spec.ts
  LoanCalculatorService
    Flat Rate calculations
      ✓ should calculate totalRepayment correctly
      ✓ should calculate installmentAmount correctly for MONTHLY
      ✓ should calculate installmentAmount correctly for WEEKLY
      ✓ should calculate installmentAmount correctly for BIWEEKLY
    Reducing Balance calculations
      ✓ should calculate installmentAmount within expected range
      ✓ should calculate totalRepayment as installment * numInstallments
      ✓ should divide monthly installment by 4 for WEEKLY frequency
      ✓ should divide monthly installment by 2 for BIWEEKLY frequency
    getNumberOfInstallments
      ✓ returns tenure for MONTHLY
      ✓ returns tenure * 4 for WEEKLY
      ✓ returns tenure * 2 for BIWEEKLY

Tests: 11 passed, 11 total
```

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/loans/loan-calculator.service.ts apps/backend/src/loans/loan-calculator.service.spec.ts
git commit -m "feat: implement LoanCalculatorService with TDD (flat rate + reducing balance)"
```

---

## Task 14: Loans Module

**Files:**
- Create: `apps/backend/src/loans/dto/create-loan.dto.ts`
- Create: `apps/backend/src/loans/dto/update-loan.dto.ts`
- Create: `apps/backend/src/loans/loans.service.ts`
- Create: `apps/backend/src/loans/loans.controller.ts`
- Create: `apps/backend/src/loans/loans.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create apps/backend/src/loans/dto/create-loan.dto.ts**

```typescript
import {
  IsString, IsNumber, IsPositive, IsEnum, IsDateString, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RepaymentFrequency, InterestModel } from '@ck-loan/shared';

export class CreateLoanDto {
  @IsString()
  customerId: string;

  @IsString()
  lenderId: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  principal: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(100)
  interestRate: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(360)
  tenureMonths: number;

  @IsEnum(RepaymentFrequency)
  repaymentFrequency: RepaymentFrequency;

  @IsEnum(InterestModel)
  interestModel: InterestModel;

  @IsDateString()
  startDate: string;
}
```

- [ ] **Step 2: Create apps/backend/src/loans/dto/update-loan.dto.ts**

```typescript
import { IsEnum, IsOptional } from 'class-validator';
import { LoanStatus } from '@ck-loan/shared';

export class UpdateLoanDto {
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;
}
```

- [ ] **Step 3: Create apps/backend/src/loans/loans.service.ts**

```typescript
import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoanCalculatorService } from './loan-calculator.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { LoanStatus } from '@ck-loan/shared';

export class LoanFilterDto extends PaginationDto {
  status?: LoanStatus;
  lenderId?: string;
  customerId?: string;
}

@Injectable()
export class LoansService {
  private readonly logger = new Logger(LoansService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: LoanCalculatorService,
  ) {}

  async findAll(query: LoanFilterDto) {
    this.logger.log('Fetching loans');

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.lenderId) where.lenderId = query.lenderId;
    if (query.customerId) where.customerId = query.customerId;
    if (query.search) {
      where.customer = {
        fullName: { contains: query.search, mode: 'insensitive' },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.loan.findMany({
        where,
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          lender: { select: { id: true, name: true } },
        },
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loan.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, fullName: true, phone: true, email: true } },
        lender: { select: { id: true, name: true } },
        repayments: { orderBy: { paidAt: 'asc' } },
      },
    });
    if (!loan) throw new NotFoundException(`Loan ${id} not found`);
    return loan;
  }

  async create(dto: CreateLoanDto) {
    this.logger.log(`Creating loan for customer: ${dto.customerId}`);

    // Validate customer and lender exist
    const [customer, lender] = await Promise.all([
      this.prisma.customer.findUnique({ where: { id: dto.customerId } }),
      this.prisma.lender.findUnique({ where: { id: dto.lenderId } }),
    ]);

    if (!customer) throw new NotFoundException('Customer not found');
    if (!lender) throw new NotFoundException('Lender not found');

    if (Number(lender.availableCapital) < dto.principal) {
      throw new BadRequestException('Lender has insufficient available capital');
    }

    const calc = this.calculator.calculate({
      principal: dto.principal,
      annualInterestRate: dto.interestRate,
      tenureMonths: dto.tenureMonths,
      repaymentFrequency: dto.repaymentFrequency,
      interestModel: dto.interestModel,
    });

    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          ...dto,
          startDate: new Date(dto.startDate),
          totalRepayment: calc.totalRepayment,
          installmentAmount: calc.installmentAmount,
        },
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          lender: { select: { id: true, name: true } },
        },
      });

      // Deduct from lender's available capital and add to totalLent
      await tx.lender.update({
        where: { id: dto.lenderId },
        data: {
          availableCapital: { decrement: dto.principal },
          totalLent: { increment: dto.principal },
        },
      });

      return loan;
    });
  }

  async update(id: string, dto: UpdateLoanDto) {
    this.logger.log(`Updating loan ${id}: status → ${dto.status}`);
    await this.findOne(id);
    return this.prisma.loan.update({ where: { id }, data: dto });
  }
}
```

- [ ] **Step 4: Create apps/backend/src/loans/loans.controller.ts**

```typescript
import {
  Controller, Get, Post, Patch,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { LoansService, LoanFilterDto } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('loans')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get()
  @RequirePermission('loans', 'read')
  findAll(@Query() query: LoanFilterDto) {
    return this.loansService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('loans', 'read')
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
  }

  @Post()
  @RequirePermission('loans', 'create')
  create(@Body() dto: CreateLoanDto) {
    return this.loansService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('loans', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateLoanDto) {
    return this.loansService.update(id, dto);
  }
}
```

- [ ] **Step 5: Create apps/backend/src/loans/loans.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { LoanCalculatorService } from './loan-calculator.service';

@Module({
  providers: [LoansService, LoanCalculatorService],
  controllers: [LoansController],
  exports: [LoanCalculatorService],
})
export class LoansModule {}
```

- [ ] **Step 6: Add LoansModule to app.module.ts**

Add `LoansModule` to the imports in `apps/backend/src/app.module.ts`:
```typescript
import { LoansModule } from './loans/loans.module';
// ... add LoansModule to imports array
```

- [ ] **Step 7: Test loans endpoint**

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@loanapp.com","password":"Admin1234!"}' | jq -r '.data.accessToken')

curl "http://localhost:3001/loans?status=ACTIVE" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.total'
```

Expected: `8`

- [ ] **Step 8: Commit**

```bash
git add apps/backend/src/loans/ apps/backend/src/app.module.ts
git commit -m "feat: implement loans module with automatic calculation on creation"
```

---

## Task 15: Repayments Module

**Files:**
- Create: `apps/backend/src/repayments/dto/create-repayment.dto.ts`
- Create: `apps/backend/src/repayments/repayments.service.ts`
- Create: `apps/backend/src/repayments/repayments.controller.ts`
- Create: `apps/backend/src/repayments/repayments.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create apps/backend/src/repayments/dto/create-repayment.dto.ts**

```typescript
import { IsString, IsNumber, IsPositive, IsDateString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRepaymentDto {
  @IsString()
  loanId: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  paidAmount: number;

  @IsDateString()
  paidAt: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  overdueDays?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

- [ ] **Step 2: Create apps/backend/src/repayments/repayments.service.ts**

```typescript
import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateRepaymentDto } from './dto/create-repayment.dto';

export class RepaymentFilterDto extends PaginationDto {
  loanId?: string;
}

@Injectable()
export class RepaymentsService {
  private readonly logger = new Logger(RepaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: RepaymentFilterDto) {
    this.logger.log('Fetching repayments');
    const where = query.loanId ? { loanId: query.loanId } : {};

    const [items, total] = await Promise.all([
      this.prisma.repayment.findMany({
        where,
        include: {
          loan: {
            select: {
              id: true,
              status: true,
              customer: { select: { fullName: true } },
            },
          },
        },
        skip: query.skip,
        take: query.limit,
        orderBy: { paidAt: 'desc' },
      }),
      this.prisma.repayment.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async create(dto: CreateRepaymentDto) {
    this.logger.log(`Recording repayment for loan: ${dto.loanId}`);

    const loan = await this.prisma.loan.findUnique({
      where: { id: dto.loanId },
      include: { repayments: { orderBy: { paidAt: 'desc' }, take: 1 } },
    });

    if (!loan) throw new NotFoundException('Loan not found');
    if (loan.status === 'COMPLETED') {
      throw new BadRequestException('Loan is already completed');
    }
    if (loan.status === 'DEFAULTED') {
      throw new BadRequestException('Cannot record repayment for a defaulted loan');
    }

    const lastRepayment = loan.repayments[0];
    const previousBalance = lastRepayment
      ? Number(lastRepayment.remainingBalance)
      : Number(loan.totalRepayment);

    const remainingBalance = Math.max(0, previousBalance - dto.paidAmount);

    return this.prisma.$transaction(async (tx) => {
      const repayment = await tx.repayment.create({
        data: {
          loanId: dto.loanId,
          paidAmount: dto.paidAmount,
          paidAt: new Date(dto.paidAt),
          remainingBalance,
          overdueDays: dto.overdueDays ?? 0,
          notes: dto.notes,
        },
      });

      // Auto-complete loan if balance is zero
      if (remainingBalance === 0) {
        await tx.loan.update({
          where: { id: dto.loanId },
          data: { status: 'COMPLETED' },
        });
      }

      return repayment;
    });
  }
}
```

- [ ] **Step 3: Create apps/backend/src/repayments/repayments.controller.ts**

```typescript
import {
  Controller, Get, Post, Body, Query, UseGuards,
} from '@nestjs/common';
import { RepaymentsService, RepaymentFilterDto } from './repayments.service';
import { CreateRepaymentDto } from './dto/create-repayment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('repayments')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RepaymentsController {
  constructor(private readonly repaymentsService: RepaymentsService) {}

  @Get()
  @RequirePermission('repayments', 'read')
  findAll(@Query() query: RepaymentFilterDto) {
    return this.repaymentsService.findAll(query);
  }

  @Post()
  @RequirePermission('repayments', 'create')
  create(@Body() dto: CreateRepaymentDto) {
    return this.repaymentsService.create(dto);
  }
}
```

- [ ] **Step 4: Create apps/backend/src/repayments/repayments.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { RepaymentsService } from './repayments.service';
import { RepaymentsController } from './repayments.controller';

@Module({
  providers: [RepaymentsService],
  controllers: [RepaymentsController],
})
export class RepaymentsModule {}
```

- [ ] **Step 5: Add RepaymentsModule to app.module.ts**

Add `RepaymentsModule` to the imports in `apps/backend/src/app.module.ts`:
```typescript
import { RepaymentsModule } from './repayments/repayments.module';
// ... add RepaymentsModule to imports array
```

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/repayments/ apps/backend/src/app.module.ts
git commit -m "feat: implement repayments module with auto-completion on full payment"
```

---

## Task 16: Dashboard Module

**Files:**
- Create: `apps/backend/src/dashboard/dashboard.service.ts`
- Create: `apps/backend/src/dashboard/dashboard.controller.ts`
- Create: `apps/backend/src/dashboard/dashboard.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create apps/backend/src/dashboard/dashboard.service.ts**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getKpis() {
    this.logger.log('Fetching dashboard KPIs');

    const [totalLoans, activeLoans, completedLoans, defaultedLoans, overdueCount, outstanding] =
      await Promise.all([
        this.prisma.loan.count(),
        this.prisma.loan.count({ where: { status: 'ACTIVE' } }),
        this.prisma.loan.count({ where: { status: 'COMPLETED' } }),
        this.prisma.loan.count({ where: { status: 'DEFAULTED' } }),
        this.prisma.repayment.count({ where: { overdueDays: { gt: 0 } } }),
        this.prisma.loan.aggregate({
          where: { status: 'ACTIVE' },
          _sum: { totalRepayment: true },
        }),
      ]);

    // Calculate total outstanding (totalRepayment of active loans - total paid)
    const totalPaidOnActive = await this.prisma.repayment.aggregate({
      where: { loan: { status: 'ACTIVE' } },
      _sum: { paidAmount: true },
    });

    const totalOutstanding =
      Number(outstanding._sum.totalRepayment ?? 0) -
      Number(totalPaidOnActive._sum.paidAmount ?? 0);

    return {
      totalLoans,
      activeLoans,
      completedLoans,
      defaultedLoans,
      totalOutstanding: Math.max(0, totalOutstanding).toFixed(2),
      overdueCount,
    };
  }

  async getCharts() {
    this.logger.log('Fetching dashboard chart data');

    const loans = await this.prisma.loan.findMany({
      select: {
        principal: true,
        status: true,
        startDate: true,
        createdAt: true,
      },
    });

    const repayments = await this.prisma.repayment.findMany({
      select: {
        paidAmount: true,
        paidAt: true,
        overdueDays: true,
      },
    });

    // Monthly disbursement (last 12 months)
    const monthlyMap = new Map<string, { disbursed: number; repaid: number }>();
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, { disbursed: 0, repaid: 0 });
    }

    loans.forEach((loan) => {
      const key = `${loan.startDate.getFullYear()}-${String(loan.startDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap.has(key)) {
        monthlyMap.get(key)!.disbursed += Number(loan.principal);
      }
    });

    repayments.forEach((r) => {
      const key = `${r.paidAt.getFullYear()}-${String(r.paidAt.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap.has(key)) {
        monthlyMap.get(key)!.repaid += Number(r.paidAmount);
      }
    });

    const monthly = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      disbursed: Math.round(data.disbursed),
      repaid: Math.round(data.repaid),
    }));

    // Status breakdown
    const statusCounts = await this.prisma.loan.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const statusBreakdown = statusCounts.map((s) => ({
      status: s.status,
      count: s._count.status,
    }));

    // Overdue trend (last 12 months)
    const overdueTrend = Array.from(monthlyMap.keys()).map((month) => {
      const [year, mo] = month.split('-').map(Number);
      const start = new Date(year, mo - 1, 1);
      const end = new Date(year, mo, 1);
      const count = repayments.filter(
        (r) =>
          r.overdueDays > 0 &&
          r.paidAt >= start &&
          r.paidAt < end,
      ).length;
      return { month, overdue: count };
    });

    return { monthly, statusBreakdown, overdueTrend };
  }
}
```

- [ ] **Step 2: Create apps/backend/src/dashboard/dashboard.controller.ts**

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  getKpis() {
    return this.dashboardService.getKpis();
  }

  @Get('charts')
  getCharts() {
    return this.dashboardService.getCharts();
  }
}
```

- [ ] **Step 3: Create apps/backend/src/dashboard/dashboard.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
```

- [ ] **Step 4: Final app.module.ts — all modules imported**

Replace the entire content of `apps/backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UserGroupsModule } from './user-groups/user-groups.module';
import { LendersModule } from './lenders/lenders.module';
import { CustomersModule } from './customers/customers.module';
import { LoansModule } from './loans/loans.module';
import { RepaymentsModule } from './repayments/repayments.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    UserGroupsModule,
    LendersModule,
    CustomersModule,
    LoansModule,
    RepaymentsModule,
    DashboardModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 5: Test dashboard endpoints**

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@loanapp.com","password":"Admin1234!"}' | jq -r '.data.accessToken')

curl http://localhost:3001/dashboard/kpis \
  -H "Authorization: Bearer $TOKEN" | jq '.data'
```

Expected:
```json
{
  "totalLoans": 15,
  "activeLoans": 8,
  "completedLoans": 5,
  "defaultedLoans": 2,
  "totalOutstanding": "...",
  "overdueCount": ...
}
```

- [ ] **Step 6: Run all tests**

```bash
cd apps/backend && npm test
```

Expected: all tests pass (LoanCalculatorService spec).

- [ ] **Step 7: Commit**

```bash
git add apps/backend/src/dashboard/ apps/backend/src/app.module.ts
git commit -m "feat: implement dashboard module with KPI and chart aggregations"
```

---

## Phase 2 Complete ✅

The backend REST API is fully implemented:
- JWT auth with HTTP-only refresh token cookie
- RBAC: permission guard + configurable user groups
- All CRUD modules: users, user-groups, lenders, customers, loans, repayments
- Dashboard: KPI aggregations + monthly, status, overdue chart data
- LoanCalculatorService tested with 11 unit tests
- All endpoints protected and validated

**Proceed to:** `2026-04-16-phase3-frontend.md`
