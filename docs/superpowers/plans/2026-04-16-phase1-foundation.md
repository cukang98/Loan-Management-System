# Loan System — Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Turborepo monorepo, Docker Compose stack, shared TypeScript types package, NestJS bootstrap, Prisma schema with migration, and seed data — producing a running PostgreSQL + NestJS API with tables and seed data accessible at `http://localhost:3001`.

**Architecture:** npm workspaces + Turborepo monorepo at `ck-loan-system/`. Three Docker services (postgres, backend, frontend placeholder). Shared types live in `packages/shared` and are consumed by both apps. Prisma schema is co-located with the backend.

**Tech Stack:** Node.js 20, npm workspaces, Turborepo 2, Docker Compose, NestJS 10, Prisma 5, PostgreSQL 16, TypeScript 5, bcryptjs

---

## File Map

| File | Purpose |
|---|---|
| `package.json` | Workspaces root, Turborepo scripts |
| `turbo.json` | Pipeline: dev, build, test, lint |
| `docker-compose.yml` | postgres + backend + frontend services |
| `.gitignore` | Node, Next.js, NestJS, env ignores |
| `packages/shared/package.json` | Shared package config |
| `packages/shared/tsconfig.json` | TS config for shared package |
| `packages/shared/src/enums/index.ts` | LoanStatus, RepaymentFrequency, InterestModel |
| `packages/shared/src/types/index.ts` | Shared response/DTO types |
| `packages/shared/src/index.ts` | Barrel export |
| `apps/backend/package.json` | NestJS deps |
| `apps/backend/tsconfig.json` | TS config |
| `apps/backend/tsconfig.build.json` | Build TS config |
| `apps/backend/nest-cli.json` | NestJS CLI config |
| `apps/backend/.env.example` | Env template |
| `apps/backend/Dockerfile.dev` | Dev Docker image |
| `apps/backend/prisma/schema.prisma` | Full Prisma schema |
| `apps/backend/prisma/seed.ts` | Seed: users, lenders, customers, loans, repayments |
| `apps/backend/src/main.ts` | NestJS bootstrap |
| `apps/backend/src/app.module.ts` | Root module |
| `apps/backend/src/prisma/prisma.module.ts` | Prisma module |
| `apps/backend/src/prisma/prisma.service.ts` | PrismaService (singleton) |
| `apps/frontend/Dockerfile.dev` | Dev Docker image (placeholder) |
| `apps/frontend/package.json` | Placeholder package |

---

## Task 1: Monorepo Root Scaffold

**Files:**
- Create: `package.json`
- Create: `turbo.json`
- Create: `.gitignore`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "ck-loan-system",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.5"
  }
}
```

- [ ] **Step 2: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    }
  }
}
```

- [ ] **Step 3: Create .gitignore**

```
# Dependencies
node_modules
.pnp
.pnp.js

# Build outputs
dist
build
.next
out

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode
.idea

# Turbo
.turbo

# Prisma
prisma/dev.db
```

- [ ] **Step 4: Create directory structure**

```bash
mkdir -p packages/shared/src/enums
mkdir -p packages/shared/src/types
mkdir -p apps/backend/src
mkdir -p apps/backend/prisma
mkdir -p apps/frontend
```

- [ ] **Step 5: Commit**

```bash
git init
git add package.json turbo.json .gitignore
git commit -m "chore: initialize monorepo with Turborepo"
```

---

## Task 2: Shared Types Package

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/enums/index.ts`
- Create: `packages/shared/src/types/index.ts`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Create packages/shared/package.json**

```json
{
  "name": "@ck-loan/shared",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc --noEmit",
    "lint": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.4.5"
  }
}
```

- [ ] **Step 2: Create packages/shared/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create packages/shared/src/enums/index.ts**

```typescript
export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DEFAULTED = 'DEFAULTED',
}

export enum RepaymentFrequency {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum InterestModel {
  FLAT = 'FLAT',
  REDUCING = 'REDUCING',
}

export enum PermissionModule {
  LOANS = 'loans',
  CUSTOMERS = 'customers',
  LENDERS = 'lenders',
  REPAYMENTS = 'repayments',
  USERS = 'users',
  USER_GROUPS = 'user-groups',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}
```

- [ ] **Step 4: Create packages/shared/src/types/index.ts**

```typescript
import { LoanStatus, RepaymentFrequency, InterestModel } from '../enums';

// Generic API response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<PaginatedData<T>> {}

// Permission & User Group
export interface PermissionDto {
  module: string;
  action: string;
}

export interface UserGroupDto {
  id: string;
  name: string;
  isSuperAdmin: boolean;
  permissions: PermissionDto[];
  createdAt: string;
}

// User
export interface UserDto {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  userGroupId: string | null;
  userGroup: UserGroupDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
  name: string;
  userGroup: UserGroupDto | null;
}

// Lender
export interface LenderDto {
  id: string;
  name: string;
  availableCapital: string;
  totalLent: string;
  createdAt: string;
  updatedAt: string;
}

// Customer
export interface CustomerDto {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Loan
export interface LoanDto {
  id: string;
  customerId: string;
  customer: Pick<CustomerDto, 'id' | 'fullName' | 'phone'>;
  lenderId: string;
  lender: Pick<LenderDto, 'id' | 'name'>;
  principal: string;
  interestRate: string;
  tenureMonths: number;
  repaymentFrequency: RepaymentFrequency;
  interestModel: InterestModel;
  totalRepayment: string;
  installmentAmount: string;
  status: LoanStatus;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

// Repayment
export interface RepaymentDto {
  id: string;
  loanId: string;
  paidAmount: string;
  paidAt: string;
  remainingBalance: string;
  overdueDays: number;
  notes: string | null;
  createdAt: string;
}

// Dashboard
export interface KpiData {
  totalLoans: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  totalOutstanding: string;
  overdueCount: number;
}

export interface MonthlyChartPoint {
  month: string;
  disbursed: number;
  repaid: number;
}

export interface StatusChartPoint {
  status: LoanStatus;
  count: number;
}

export interface OverdueTrendPoint {
  month: string;
  overdue: number;
}

export interface ChartData {
  monthly: MonthlyChartPoint[];
  statusBreakdown: StatusChartPoint[];
  overdueTrend: OverdueTrendPoint[];
}
```

- [ ] **Step 5: Create packages/shared/src/index.ts**

```typescript
export * from './enums';
export * from './types';
```

- [ ] **Step 6: Commit**

```bash
git add packages/
git commit -m "feat: add shared TypeScript types and enums package"
```

---

## Task 3: Docker Compose & Backend Dockerfile

**Files:**
- Create: `docker-compose.yml`
- Create: `apps/backend/Dockerfile.dev`
- Create: `apps/frontend/Dockerfile.dev` (placeholder)
- Create: `apps/frontend/package.json` (placeholder)

- [ ] **Step 1: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: loan_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: loandb
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile.dev
    container_name: loan_backend
    ports:
      - '3001:3001'
    volumes:
      - ./apps/backend:/app
      - /app/node_modules
    env_file:
      - ./apps/backend/.env
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/loandb
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile.dev
    container_name: loan_frontend
    ports:
      - '3000:3000'
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules
      - /app/.next
    env_file:
      - ./apps/frontend/.env.local
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  pgdata:
```

- [ ] **Step 2: Create apps/backend/Dockerfile.dev**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]
```

- [ ] **Step 3: Create apps/frontend/Dockerfile.dev (placeholder)**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

- [ ] **Step 4: Create apps/frontend/package.json (placeholder — will be replaced in Phase 3)**

```json
{
  "name": "@ck-loan/frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "echo 'Frontend not yet built'"
  }
}
```

- [ ] **Step 5: Create apps/frontend/.env.local**

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- [ ] **Step 6: Commit**

```bash
git add docker-compose.yml apps/backend/Dockerfile.dev apps/frontend/
git commit -m "chore: add Docker Compose and Dockerfile for local development"
```

---

## Task 4: NestJS Backend Bootstrap

**Files:**
- Create: `apps/backend/package.json`
- Create: `apps/backend/tsconfig.json`
- Create: `apps/backend/tsconfig.build.json`
- Create: `apps/backend/nest-cli.json`
- Create: `apps/backend/.env.example`
- Create: `apps/backend/.env`
- Create: `apps/backend/src/main.ts`
- Create: `apps/backend/src/app.module.ts`
- Create: `apps/backend/src/prisma/prisma.module.ts`
- Create: `apps/backend/src/prisma/prisma.service.ts`
- Create: `apps/backend/src/common/dto/pagination.dto.ts`
- Create: `apps/backend/src/common/filters/http-exception.filter.ts`
- Create: `apps/backend/src/common/interceptors/response.interceptor.ts`

- [ ] **Step 1: Create apps/backend/package.json**

```json
{
  "name": "@ck-loan/backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/config": "^3.2.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.3.0",
    "@prisma/client": "^5.13.0",
    "@ck-loan/shared": "*",
    "bcryptjs": "^2.4.3",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "cookie-parser": "^1.4.6",
    "morgan": "^1.10.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.2",
    "@nestjs/schematics": "^10.1.1",
    "@nestjs/testing": "^10.3.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.7",
    "@types/express": "^4.17.21",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.12.0",
    "@types/passport-jwt": "^4.0.1",
    "jest": "^29.7.0",
    "prisma": "^5.13.0",
    "ts-jest": "^29.1.2",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

- [ ] **Step 2: Create apps/backend/tsconfig.json**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "paths": {
      "@ck-loan/shared": ["../../packages/shared/src"]
    }
  }
}
```

- [ ] **Step 3: Create apps/backend/tsconfig.build.json**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

- [ ] **Step 4: Create apps/backend/nest-cli.json**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

- [ ] **Step 5: Create apps/backend/.env.example**

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/loandb
JWT_SECRET=change-this-jwt-secret-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=change-this-refresh-secret-in-production
REFRESH_TOKEN_EXPIRES_IN=30d
PORT=3001
FRONTEND_URL=http://localhost:3000
```

- [ ] **Step 6: Create apps/backend/.env (copy from example, used locally)**

```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/loandb
JWT_SECRET=dev-jwt-secret-do-not-use-in-prod
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=dev-refresh-secret-do-not-use-in-prod
REFRESH_TOKEN_EXPIRES_IN=30d
PORT=3001
FRONTEND_URL=http://localhost:3000
```

- [ ] **Step 7: Create apps/backend/src/prisma/prisma.service.ts**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }
}
```

- [ ] **Step 8: Create apps/backend/src/prisma/prisma.module.ts**

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 9: Create apps/backend/src/common/dto/pagination.dto.ts**

```typescript
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
```

- [ ] **Step 10: Create apps/backend/src/common/filters/http-exception.filter.ts**

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    this.logger.error(
      `${request.method} ${request.url} → ${status}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    const errorBody =
      typeof message === 'object' && message !== null
        ? message
        : { message };

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...errorBody,
    });
  }
}
```

- [ ] **Step 11: Create apps/backend/src/common/interceptors/response.interceptor.ts**

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseData<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseData<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseData<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
      })),
    );
  }
}
```

- [ ] **Step 12: Create apps/backend/src/app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 13: Create apps/backend/src/main.ts**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.use(morgan('dev'));

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Backend running on http://localhost:${port}`);
}

bootstrap();
```

- [ ] **Step 14: Install backend dependencies**

```bash
cd apps/backend && npm install
```

- [ ] **Step 15: Verify NestJS compiles**

```bash
cd apps/backend && npm run build
```

Expected: `dist/` directory created, no TypeScript errors.

- [ ] **Step 16: Commit**

```bash
git add apps/backend/
git commit -m "feat: bootstrap NestJS backend with Prisma, validation, and error handling"
```

---

## Task 5: Prisma Schema & Migration

**Files:**
- Create: `apps/backend/prisma/schema.prisma`

- [ ] **Step 1: Create apps/backend/prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  password      String
  name          String
  isActive      Boolean        @default(true)
  userGroupId   String?
  userGroup     UserGroup?     @relation(fields: [userGroupId], references: [id])
  refreshTokens RefreshToken[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([email])
}

model UserGroup {
  id           String       @id @default(cuid())
  name         String       @unique
  isSuperAdmin Boolean      @default(false)
  permissions  Permission[]
  users        User[]
  createdAt    DateTime     @default(now())
}

model Permission {
  id          String    @id @default(cuid())
  module      String
  action      String
  userGroupId String
  userGroup   UserGroup @relation(fields: [userGroupId], references: [id], onDelete: Cascade)

  @@unique([module, action, userGroupId])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
}

model Lender {
  id               String   @id @default(cuid())
  name             String
  availableCapital Decimal  @db.Decimal(15, 2)
  totalLent        Decimal  @default(0) @db.Decimal(15, 2)
  loans            Loan[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Customer {
  id        String   @id @default(cuid())
  fullName  String
  phone     String
  email     String?
  address   String?
  notes     String?
  loans     Loan[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([fullName])
}

model Loan {
  id                 String             @id @default(cuid())
  customerId         String
  customer           Customer           @relation(fields: [customerId], references: [id])
  lenderId           String
  lender             Lender             @relation(fields: [lenderId], references: [id])
  principal          Decimal            @db.Decimal(15, 2)
  interestRate       Decimal            @db.Decimal(5, 2)
  tenureMonths       Int
  repaymentFrequency RepaymentFrequency
  interestModel      InterestModel
  totalRepayment     Decimal            @db.Decimal(15, 2)
  installmentAmount  Decimal            @db.Decimal(15, 2)
  status             LoanStatus         @default(ACTIVE)
  startDate          DateTime
  repayments         Repayment[]
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  @@index([customerId])
  @@index([lenderId])
  @@index([status])
}

model Repayment {
  id               String   @id @default(cuid())
  loanId           String
  loan             Loan     @relation(fields: [loanId], references: [id])
  paidAmount       Decimal  @db.Decimal(15, 2)
  paidAt           DateTime
  remainingBalance Decimal  @db.Decimal(15, 2)
  overdueDays      Int      @default(0)
  notes            String?
  createdAt        DateTime @default(now())

  @@index([loanId])
}

enum LoanStatus {
  ACTIVE
  COMPLETED
  DEFAULTED
}

enum RepaymentFrequency {
  WEEKLY
  BIWEEKLY
  MONTHLY
}

enum InterestModel {
  FLAT
  REDUCING
}
```

- [ ] **Step 2: Start postgres via Docker**

```bash
docker-compose up postgres -d
```

Expected: postgres container starts, healthcheck passes.

- [ ] **Step 3: Generate Prisma client**

```bash
cd apps/backend && npx prisma generate
```

Expected: `@prisma/client` generated, no errors.

- [ ] **Step 4: Run migration**

```bash
cd apps/backend && npx prisma migrate dev --name init
```

Expected: Migration `0001_init` created and applied. All tables created in `loandb`.

- [ ] **Step 5: Verify tables exist**

```bash
cd apps/backend && npx prisma studio
```

Open `http://localhost:5555` and confirm tables: User, UserGroup, Permission, RefreshToken, Lender, Customer, Loan, Repayment. Then close Prisma Studio (Ctrl+C).

- [ ] **Step 6: Commit**

```bash
git add apps/backend/prisma/
git commit -m "feat: add Prisma schema with all models and initial migration"
```

---

## Task 6: Seed Data

**Files:**
- Create: `apps/backend/prisma/seed.ts`
- Modify: `apps/backend/package.json` (add prisma.seed config)

- [ ] **Step 1: Add seed config to apps/backend/package.json**

Add the `prisma` key inside `package.json` at the top level (alongside `scripts`):

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

- [ ] **Step 2: Create apps/backend/prisma/seed.ts**

```typescript
import { PrismaClient, LoanStatus, RepaymentFrequency, InterestModel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (order matters for FK constraints)
  await prisma.repayment.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.lender.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.userGroup.deleteMany();

  // --- User Groups ---
  const modules = ['loans', 'customers', 'lenders', 'repayments', 'users', 'user-groups'];
  const actions = ['create', 'read', 'update', 'delete'];

  const superAdminGroup = await prisma.userGroup.create({
    data: {
      name: 'Super Admin',
      isSuperAdmin: true,
    },
  });

  const loanOfficerGroup = await prisma.userGroup.create({
    data: {
      name: 'Loan Officer',
      isSuperAdmin: false,
      permissions: {
        create: [
          { module: 'loans', action: 'create' },
          { module: 'loans', action: 'read' },
          { module: 'loans', action: 'update' },
          { module: 'customers', action: 'create' },
          { module: 'customers', action: 'read' },
          { module: 'customers', action: 'update' },
          { module: 'repayments', action: 'create' },
          { module: 'repayments', action: 'read' },
          { module: 'lenders', action: 'read' },
        ],
      },
    },
  });

  const viewerGroup = await prisma.userGroup.create({
    data: {
      name: 'Viewer',
      isSuperAdmin: false,
      permissions: {
        create: modules.map((module) => ({ module, action: 'read' })),
      },
    },
  });

  console.log('✅ User groups created');

  // --- Users ---
  const passwordHash = await bcrypt.hash('Admin1234!', 12);
  const staffHash = await bcrypt.hash('Staff1234!', 12);
  const viewerHash = await bcrypt.hash('View1234!', 12);

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@loanapp.com',
        password: passwordHash,
        name: 'System Administrator',
        userGroupId: superAdminGroup.id,
      },
      {
        email: 'officer@loanapp.com',
        password: staffHash,
        name: 'Loan Officer',
        userGroupId: loanOfficerGroup.id,
      },
      {
        email: 'viewer@loanapp.com',
        password: viewerHash,
        name: 'Report Viewer',
        userGroupId: viewerGroup.id,
      },
    ],
  });

  console.log('✅ Users created');

  // --- Lenders ---
  const lenders = await Promise.all([
    prisma.lender.create({
      data: { name: 'Capital Partners Ltd', availableCapital: 500000, totalLent: 0 },
    }),
    prisma.lender.create({
      data: { name: 'Golden Finance Group', availableCapital: 250000, totalLent: 0 },
    }),
    prisma.lender.create({
      data: { name: 'Sunrise Credit Co.', availableCapital: 150000, totalLent: 0 },
    }),
  ]);

  console.log('✅ Lenders created');

  // --- Customers ---
  const customers = await Promise.all([
    prisma.customer.create({ data: { fullName: 'Zhang Wei', phone: '012-3456789', email: 'zhang.wei@email.com', address: 'Kuala Lumpur' } }),
    prisma.customer.create({ data: { fullName: 'Lim Mei Ling', phone: '011-2345678', email: 'lim.mei@email.com', address: 'Penang' } }),
    prisma.customer.create({ data: { fullName: 'Ahmad Razif', phone: '017-8901234', address: 'Johor Bahru' } }),
    prisma.customer.create({ data: { fullName: 'Priya Nair', phone: '016-7890123', email: 'priya.n@email.com', address: 'Ipoh' } }),
    prisma.customer.create({ data: { fullName: 'Tan Chee Keong', phone: '019-6789012', address: 'Selangor' } }),
    prisma.customer.create({ data: { fullName: 'Nurul Aisyah', phone: '013-5678901', email: 'nurul.a@email.com', address: 'Kuala Lumpur' } }),
    prisma.customer.create({ data: { fullName: 'Wong Jia Hui', phone: '014-4567890', address: 'Kota Kinabalu' } }),
    prisma.customer.create({ data: { fullName: 'Ravi Kumar', phone: '018-3456789', email: 'ravi.k@email.com', address: 'Petaling Jaya' } }),
    prisma.customer.create({ data: { fullName: 'Siti Zaleha', phone: '010-2345678', address: 'Shah Alam' } }),
    prisma.customer.create({ data: { fullName: 'Liang Qing', phone: '015-1234567', email: 'liang.q@email.com', address: 'Melaka' } }),
  ]);

  console.log('✅ Customers created');

  // --- Loans ---
  // Helper: calculate flat rate
  function calcFlat(principal: number, rate: number, tenureMonths: number, freq: RepaymentFrequency) {
    const interest = principal * (rate / 100) * (tenureMonths / 12);
    const total = principal + interest;
    const installments = freq === 'WEEKLY' ? tenureMonths * 4 : freq === 'BIWEEKLY' ? tenureMonths * 2 : tenureMonths;
    return { totalRepayment: total, installmentAmount: total / installments };
  }

  // Helper: calculate reducing balance
  function calcReducing(principal: number, rate: number, tenureMonths: number, freq: RepaymentFrequency) {
    const monthlyRate = rate / 100 / 12;
    const installment = principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -tenureMonths));
    const freqMultiplier = freq === 'WEEKLY' ? 4 : freq === 'BIWEEKLY' ? 2 : 1;
    const perPeriodInstallment = installment / freqMultiplier;
    const numInstallments = tenureMonths * freqMultiplier;
    return { totalRepayment: perPeriodInstallment * numInstallments, installmentAmount: perPeriodInstallment };
  }

  const loanDefs = [
    { customer: 0, lender: 0, principal: 10000, rate: 8, tenure: 12, freq: RepaymentFrequency.MONTHLY, model: InterestModel.FLAT, status: LoanStatus.ACTIVE, startDate: new Date('2025-06-01') },
    { customer: 1, lender: 0, principal: 25000, rate: 6.5, tenure: 24, freq: RepaymentFrequency.MONTHLY, model: InterestModel.REDUCING, status: LoanStatus.ACTIVE, startDate: new Date('2025-07-01') },
    { customer: 2, lender: 1, principal: 5000, rate: 10, tenure: 6, freq: RepaymentFrequency.WEEKLY, model: InterestModel.FLAT, status: LoanStatus.ACTIVE, startDate: new Date('2025-08-01') },
    { customer: 3, lender: 1, principal: 15000, rate: 7, tenure: 18, freq: RepaymentFrequency.MONTHLY, model: InterestModel.REDUCING, status: LoanStatus.ACTIVE, startDate: new Date('2025-09-01') },
    { customer: 4, lender: 2, principal: 8000, rate: 9, tenure: 12, freq: RepaymentFrequency.BIWEEKLY, model: InterestModel.FLAT, status: LoanStatus.ACTIVE, startDate: new Date('2025-10-01') },
    { customer: 5, lender: 0, principal: 30000, rate: 5.5, tenure: 36, freq: RepaymentFrequency.MONTHLY, model: InterestModel.REDUCING, status: LoanStatus.ACTIVE, startDate: new Date('2025-11-01') },
    { customer: 6, lender: 2, principal: 12000, rate: 8.5, tenure: 12, freq: RepaymentFrequency.MONTHLY, model: InterestModel.FLAT, status: LoanStatus.ACTIVE, startDate: new Date('2025-12-01') },
    { customer: 7, lender: 1, principal: 20000, rate: 7.5, tenure: 24, freq: RepaymentFrequency.MONTHLY, model: InterestModel.REDUCING, status: LoanStatus.ACTIVE, startDate: new Date('2026-01-01') },
    // Completed
    { customer: 0, lender: 0, principal: 5000, rate: 8, tenure: 3, freq: RepaymentFrequency.MONTHLY, model: InterestModel.FLAT, status: LoanStatus.COMPLETED, startDate: new Date('2024-06-01') },
    { customer: 1, lender: 1, principal: 8000, rate: 6, tenure: 6, freq: RepaymentFrequency.MONTHLY, model: InterestModel.REDUCING, status: LoanStatus.COMPLETED, startDate: new Date('2024-07-01') },
    { customer: 2, lender: 2, principal: 3000, rate: 10, tenure: 3, freq: RepaymentFrequency.MONTHLY, model: InterestModel.FLAT, status: LoanStatus.COMPLETED, startDate: new Date('2024-09-01') },
    { customer: 8, lender: 0, principal: 10000, rate: 7, tenure: 6, freq: RepaymentFrequency.MONTHLY, model: InterestModel.REDUCING, status: LoanStatus.COMPLETED, startDate: new Date('2024-10-01') },
    { customer: 9, lender: 1, principal: 6000, rate: 9, tenure: 4, freq: RepaymentFrequency.MONTHLY, model: InterestModel.FLAT, status: LoanStatus.COMPLETED, startDate: new Date('2024-12-01') },
    // Defaulted
    { customer: 3, lender: 2, principal: 15000, rate: 12, tenure: 12, freq: RepaymentFrequency.MONTHLY, model: InterestModel.FLAT, status: LoanStatus.DEFAULTED, startDate: new Date('2024-01-01') },
    { customer: 4, lender: 0, principal: 20000, rate: 11, tenure: 18, freq: RepaymentFrequency.MONTHLY, model: InterestModel.REDUCING, status: LoanStatus.DEFAULTED, startDate: new Date('2024-03-01') },
  ];

  const createdLoans = [];
  for (const def of loanDefs) {
    const calc = def.model === InterestModel.FLAT
      ? calcFlat(def.principal, def.rate, def.tenure, def.freq)
      : calcReducing(def.principal, def.rate, def.tenure, def.freq);

    const loan = await prisma.loan.create({
      data: {
        customerId: customers[def.customer].id,
        lenderId: lenders[def.lender].id,
        principal: def.principal,
        interestRate: def.rate,
        tenureMonths: def.tenure,
        repaymentFrequency: def.freq,
        interestModel: def.model,
        totalRepayment: Math.round(calc.totalRepayment * 100) / 100,
        installmentAmount: Math.round(calc.installmentAmount * 100) / 100,
        status: def.status,
        startDate: def.startDate,
      },
    });
    createdLoans.push(loan);

    // Update lender totalLent
    await prisma.lender.update({
      where: { id: lenders[def.lender].id },
      data: { totalLent: { increment: def.principal } },
    });
  }

  console.log('✅ Loans created');

  // --- Repayments for active loans (partial repayments with some overdue) ---
  const now = new Date();

  for (let i = 0; i < 8; i++) {
    const loan = createdLoans[i];
    const installment = parseFloat(loan.installmentAmount.toString());
    let remaining = parseFloat(loan.totalRepayment.toString());
    const numRepayments = Math.min(3, Math.floor(Math.random() * 4) + 1);

    for (let j = 0; j < numRepayments; j++) {
      remaining -= installment;
      const paidAt = new Date(loan.startDate);
      paidAt.setMonth(paidAt.getMonth() + j + 1);
      const isOverdue = paidAt < now && Math.random() > 0.6;
      const overdueDays = isOverdue ? Math.floor(Math.random() * 45) + 1 : 0;

      await prisma.repayment.create({
        data: {
          loanId: loan.id,
          paidAmount: Math.round(installment * 100) / 100,
          paidAt,
          remainingBalance: Math.max(0, Math.round(remaining * 100) / 100),
          overdueDays,
        },
      });
    }
  }

  // Full repayments for completed loans
  for (let i = 8; i < 13; i++) {
    const loan = createdLoans[i];
    const installment = parseFloat(loan.installmentAmount.toString());
    let remaining = parseFloat(loan.totalRepayment.toString());
    const numInstallments = loan.tenureMonths;

    for (let j = 0; j < numInstallments; j++) {
      remaining -= installment;
      const paidAt = new Date(loan.startDate);
      paidAt.setMonth(paidAt.getMonth() + j + 1);

      await prisma.repayment.create({
        data: {
          loanId: loan.id,
          paidAmount: Math.round(installment * 100) / 100,
          paidAt,
          remainingBalance: Math.max(0, Math.round(remaining * 100) / 100),
          overdueDays: 0,
        },
      });
    }
  }

  // Partial repayments for defaulted loans (stopped early)
  for (let i = 13; i < 15; i++) {
    const loan = createdLoans[i];
    const installment = parseFloat(loan.installmentAmount.toString());
    let remaining = parseFloat(loan.totalRepayment.toString());

    for (let j = 0; j < 2; j++) {
      remaining -= installment;
      const paidAt = new Date(loan.startDate);
      paidAt.setMonth(paidAt.getMonth() + j + 1);

      await prisma.repayment.create({
        data: {
          loanId: loan.id,
          paidAmount: Math.round(installment * 100) / 100,
          paidAt,
          remainingBalance: Math.max(0, Math.round(remaining * 100) / 100),
          overdueDays: 90 + j * 30,
        },
      });
    }
  }

  console.log('✅ Repayments created');
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Admin:   admin@loanapp.com  / Admin1234!');
  console.log('  Officer: officer@loanapp.com / Staff1234!');
  console.log('  Viewer:  viewer@loanapp.com / View1234!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 3: Run the seed**

```bash
cd apps/backend && npx prisma db seed
```

Expected output:
```
🌱 Seeding database...
✅ User groups created
✅ Users created
✅ Lenders created
✅ Customers created
✅ Loans created
✅ Repayments created
🎉 Seeding complete!
Login credentials:
  Admin:   admin@loanapp.com  / Admin1234!
  Officer: officer@loanapp.com / Staff1234!
  Viewer:  viewer@loanapp.com / View1234!
```

- [ ] **Step 4: Verify seed data via Prisma Studio**

```bash
cd apps/backend && npx prisma studio
```

Open `http://localhost:5555`. Verify:
- UserGroup: 3 rows (Super Admin, Loan Officer, Viewer)
- User: 3 rows
- Lender: 3 rows
- Customer: 10 rows
- Loan: 15 rows
- Repayment: ~40+ rows

Close Prisma Studio (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add apps/backend/prisma/seed.ts apps/backend/package.json
git commit -m "feat: add seed data with users, lenders, customers, loans, and repayments"
```

---

## Phase 1 Complete ✅

The foundation is ready:
- Turborepo monorepo with npm workspaces
- Shared TypeScript types in `@ck-loan/shared`
- Docker Compose with postgres + backend
- NestJS bootstrapped with Prisma, global validation, error handling, response interceptor
- All database tables created via migration
- Seed data loaded (3 user groups, 3 users, 3 lenders, 10 customers, 15 loans, ~40 repayments)

**Proceed to:** `2026-04-16-phase2-backend.md`
