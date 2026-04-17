# Loan Management Admin System — Design Spec

**Date:** 2026-04-16
**Status:** Approved

---

## 1. Overview

A production-quality, full-stack Loan Management Admin System built as a portfolio showcase. The system manages lenders, customers, loans, repayments, and users with role-based access control. The UI is modern, mobile-responsive, and bilingual (Chinese default, English toggle).

### Extensibility Principle
Code must be written for future extensibility at every layer:
- **Backend:** Each module follows a strict Controller → Service → Repository pattern. Business logic lives only in services — controllers are thin. New modules can be added by duplicating the folder structure without touching existing code.
- **Frontend:** Hooks, components, and API calls are fully decoupled. Adding a new page requires only a new route folder, a new hook file, and wiring up the existing `<DataTable>` / `<FormModal>` components.
- **Permissions:** The permission system uses string-based module/action pairs — adding a new module (e.g., `"reports"`) requires only adding seed data, no schema changes.
- **i18n:** All new UI strings must be added to both `zh.json` and `en.json` — never hardcode display text.
- **Calculations:** Loan calculation logic is isolated in a dedicated `LoanCalculator` service class, making it easy to add new interest models without touching loan creation logic.

---

## 2. Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (utility spacing/layout)
- **Ant Design** (primary component library — Table, Form, Modal, Drawer, Layout)
- **TanStack Query (React Query v5)** (server state, caching, background refetch)
- **Axios** (HTTP client with interceptors)
- **next-intl** (i18n — Chinese default, English toggle, persisted to localStorage)
- **Recharts** (dashboard charts, Ant Design compatible)

### Backend
- **NestJS** (TypeScript, decorator-based architecture)
- **REST API**
- **Prisma ORM**
- **PostgreSQL**
- **class-validator + class-transformer** (DTO validation)
- **Passport.js** (JWT strategy)
- **Morgan** (HTTP request logging)

### Infrastructure
- **Docker Compose** — postgres + backend + frontend, single `docker-compose up`
- **Turborepo** + **npm workspaces** — monorepo management

### Deployment Targets
| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Railway |
| Database | Neon (PostgreSQL) |

---

## 3. Repository Structure

```
ck-loan-system/
├── docker-compose.yml
├── package.json                  # npm workspaces root
├── turbo.json
├── packages/
│   └── shared/                   # Shared TypeScript types & enums
│       ├── src/
│       │   ├── types/            # Loan, Customer, User, Repayment DTOs
│       │   └── enums/            # LoanStatus, RepaymentFrequency, InterestModel
│       └── package.json
├── apps/
│   ├── frontend/                 # Next.js 14 App Router
│   │   ├── src/
│   │   │   ├── app/              # Routes
│   │   │   ├── components/       # Reusable UI components
│   │   │   ├── hooks/            # React Query hooks per module
│   │   │   ├── lib/              # Axios instance, auth helpers
│   │   │   └── messages/         # i18n: zh.json, en.json
│   │   ├── .env.local.example
│   │   └── package.json
│   └── backend/                  # NestJS
│       ├── src/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── roles/            # RBAC: user groups + permissions
│       │   ├── lenders/
│       │   ├── customers/
│       │   ├── loans/
│       │   ├── repayments/
│       │   ├── dashboard/
│       │   └── prisma/           # Schema + seed script
│       ├── .env.example
│       └── package.json
└── docs/
    └── superpowers/specs/
```

---

## 4. Database Schema

### Models

```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  password      String        // bcrypt hashed
  name          String
  isActive      Boolean       @default(true)
  userGroupId   String?
  userGroup     UserGroup?    @relation(fields: [userGroupId], references: [id])
  refreshTokens RefreshToken[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
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
  module      String    // "loans" | "customers" | "lenders" | "repayments" | "users" | "user-groups"
  action      String    // "create" | "read" | "update" | "delete"
  userGroupId String
  userGroup   UserGroup @relation(fields: [userGroupId], references: [id])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Lender {
  id               String   @id @default(cuid())
  name             String
  availableCapital Decimal
  totalLent        Decimal  @default(0)
  loans            Loan[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Customer {
  id       String  @id @default(cuid())
  fullName String
  phone    String
  email    String?
  address  String?
  notes    String?
  loans    Loan[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Loan {
  id                 String             @id @default(cuid())
  customerId         String
  customer           Customer           @relation(fields: [customerId], references: [id])
  lenderId           String
  lender             Lender             @relation(fields: [lenderId], references: [id])
  principal          Decimal
  interestRate       Decimal            // annual percentage
  tenureMonths       Int
  repaymentFrequency RepaymentFrequency
  interestModel      InterestModel      // FLAT | REDUCING
  totalRepayment     Decimal            // auto-calculated on create
  installmentAmount  Decimal            // auto-calculated on create
  status             LoanStatus         @default(ACTIVE)
  startDate          DateTime
  repayments         Repayment[]
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
}

model Repayment {
  id               String   @id @default(cuid())
  loanId           String
  loan             Loan     @relation(fields: [loanId], references: [id])
  paidAmount       Decimal
  paidAt           DateTime
  remainingBalance Decimal
  overdueDays      Int      @default(0)
  notes            String?
  createdAt        DateTime @default(now())
}

enum LoanStatus          { ACTIVE COMPLETED DEFAULTED }
enum RepaymentFrequency  { WEEKLY BIWEEKLY MONTHLY }
enum InterestModel       { FLAT REDUCING }
```

---

## 5. Authentication & Authorization

### Auth Flow
1. `POST /auth/login` — validates credentials, returns `accessToken` (JWT, 15min expiry) in response body + sets `refreshToken` (30 days) in HTTP-only cookie
2. Frontend stores `accessToken` in memory (React context), never in localStorage
3. Axios request interceptor attaches `Authorization: Bearer <accessToken>` header
4. Axios response interceptor catches 401 → calls `POST /auth/refresh` → receives new `accessToken` → retries original request
5. `POST /auth/logout` — invalidates refresh token server-side, clears HTTP-only cookie

### RBAC
- Every NestJS route decorated with `@RequirePermission('module', 'action')`
- `PermissionGuard` resolves current user's group permissions from DB
- `isSuperAdmin: true` on a UserGroup bypasses all permission checks
- Built-in seed: **Super Admin** group with `isSuperAdmin: true`
- Frontend `<PermissionGuard module="loans" action="delete">` hides/disables UI elements

---

## 6. API Endpoints

All endpoints require JWT except `POST /auth/login`. Pagination: `?page=1&limit=20`. Sorting: `?sortBy=createdAt&order=desc`.

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| GET | `/users` | List users |
| POST | `/users` | Create user |
| GET | `/users/:id` | Get user |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| GET | `/user-groups` | List user groups |
| POST | `/user-groups` | Create user group |
| GET | `/user-groups/:id` | Get user group with permissions |
| PATCH | `/user-groups/:id` | Update group + permissions |
| DELETE | `/user-groups/:id` | Delete user group |
| GET | `/lenders` | List lenders |
| POST | `/lenders` | Create lender |
| GET | `/lenders/:id` | Get lender |
| PATCH | `/lenders/:id` | Update lender |
| DELETE | `/lenders/:id` | Delete lender |
| GET | `/customers` | List customers (searchable) |
| POST | `/customers` | Create customer |
| GET | `/customers/:id` | Get customer |
| PATCH | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |
| GET | `/loans` | List loans (filterable by status, lenderId, customerId) |
| POST | `/loans` | Create loan (auto-calculates totals) |
| GET | `/loans/:id` | Get loan with repayment history |
| PATCH | `/loans/:id` | Update loan status |
| GET | `/repayments` | List repayments (`?loanId=`) |
| POST | `/repayments` | Record repayment |
| GET | `/dashboard/kpis` | Total loans, outstanding, overdue count |
| GET | `/dashboard/charts` | Monthly disbursement, repayment status, overdue trends |

---

## 7. Frontend Pages & Components

### Pages

| Route | Description |
|---|---|
| `/login` | Centered Ant Design Form card |
| `/dashboard` | KPI cards + 4 charts (2 rows) |
| `/customers` | DataTable + Create/Edit Modal |
| `/lenders` | DataTable + Create/Edit Modal |
| `/loans` | Filterable DataTable + multi-step Create Drawer |
| `/loans/[id]` | Loan detail + repayment timeline + record repayment |
| `/repayments` | DataTable with overdue row highlighting |
| `/users` | DataTable + Create/Edit Modal |
| `/user-groups` | DataTable + permission matrix editor |

### Reusable Components

- `<DataTable>` — Ant Design Table wrapper with built-in pagination, search input, column sort, loading skeleton, empty state
- `<KPICard>` — stat value, label, trend badge, icon (Ant Design icons)
- `<FormModal>` — Ant Design Modal wrapping a Form with consistent footer actions
- `<PermissionGuard>` — conditionally renders children based on current user permissions
- `<LanguageSwitcher>` — Ant Design Segmented or Select, toggles zh/en, persists to localStorage
- `<PageHeader>` — title, breadcrumb, action buttons row

### i18n
- `next-intl` with `messages/zh.json` (default) and `messages/en.json`
- Locale detection order: localStorage → browser → fallback `zh`
- All UI strings, table column headers, form labels, error messages, and status tags translated

### Mobile Responsiveness
- Sidebar: collapses to icon-only at `lg`, becomes Ant Design `Drawer` at `md` and below
- Tables: horizontal scroll on mobile, key columns pinned
- Forms: single-column layout on mobile, two-column on desktop
- KPI cards: 2-column grid on mobile, 4-column on desktop

---

## 8. Loan Calculation Logic

### Flat Rate
```
totalInterest = principal × (annualRate / 100) × (tenureMonths / 12)
totalRepayment = principal + totalInterest
installmentAmount = totalRepayment / numberOfInstallments
```

### Reducing Balance
```
monthlyRate = (annualRate / 100) / 12
installmentAmount = principal × monthlyRate / (1 - (1 + monthlyRate)^(-tenureMonths))
totalRepayment = installmentAmount × numberOfInstallments
```

`numberOfInstallments` derived from `tenureMonths` and `repaymentFrequency` (WEEKLY → tenure×4, BIWEEKLY → tenure×2, MONTHLY → tenure).

For the reducing balance formula, all calculations use the monthly period rate regardless of repayment frequency. The `installmentAmount` is then divided by the frequency multiplier (÷4 for WEEKLY, ÷2 for BIWEEKLY) to get the per-period payment. This is an accepted simplification for portfolio scope.

Calculations performed in the NestJS service on loan creation and stored (not recalculated on read).

---

## 9. Seed Data

| Type | Count | Details |
|---|---|---|
| User Groups | 3 | Super Admin (isSuperAdmin), Loan Officer (loans+customers read/create/update), Viewer (all read-only) |
| Users | 3 | admin@loanapp.com / Admin1234!, officer@loanapp.com / Staff1234!, viewer@loanapp.com / View1234! |
| Lenders | 3 | Mix of capital amounts |
| Customers | 10 | Realistic names, phone numbers |
| Loans | 15 | Mix of ACTIVE (8), COMPLETED (5), DEFAULTED (2), both interest models |
| Repayments | ~40 | Some overdue (overdueDays > 0) to populate dashboard meaningfully |

---

## 10. Logging

- NestJS built-in `Logger` injected into all service classes — logs method entry, errors
- Morgan HTTP middleware on the Express adapter — logs method, path, status, response time
- No external logging service (keep it simple for portfolio)

---

## 11. Environment Variables

### Backend (`apps/backend/.env`)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/loandb
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret-here
REFRESH_TOKEN_EXPIRES_IN=30d
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (`apps/frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 12. Local Setup (Quick Reference)

```bash
# 1. Clone & install
git clone <repo>
cd ck-loan-system
npm install

# 2. Copy env files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local

# 3. Start everything
docker-compose up

# 4. (First time) Run migrations + seed
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma db seed
```

App available at `http://localhost:3000`. API at `http://localhost:3001`.
