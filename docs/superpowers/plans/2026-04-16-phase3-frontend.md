# Loan System — Phase 3: Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Next.js 14 App Router frontend with Ant Design, TanStack Query, next-intl (Chinese default), and all pages — producing a fully functional UI at `http://localhost:3000`.

**Architecture:** App Router with a `(dashboard)` route group sharing the sidebar layout. Auth state in React context (access token in memory, refresh via HTTP-only cookie on mount). All server state via TanStack Query hooks. Ant Design for all UI components. next-intl with `NextIntlClientProvider` (no URL locale prefix — locale stored in localStorage).

**Prerequisites:** Phase 2 complete. Backend running at `http://localhost:3001`.

**Tech Stack:** Next.js 14, TypeScript, Ant Design 5, @ant-design/icons, TanStack Query v5, Axios, next-intl 3, Recharts, Tailwind CSS

---

## File Map

| File | Purpose |
|---|---|
| `apps/frontend/package.json` | All frontend deps |
| `apps/frontend/next.config.ts` | Next.js config |
| `apps/frontend/tailwind.config.ts` | Tailwind config |
| `apps/frontend/tsconfig.json` | TS config with path aliases |
| `apps/frontend/.env.local.example` | Env template |
| `apps/frontend/src/messages/zh.json` | Chinese strings |
| `apps/frontend/src/messages/en.json` | English strings |
| `apps/frontend/src/lib/axios.ts` | Axios instance + 401 refresh interceptor |
| `apps/frontend/src/lib/auth.ts` | In-memory token helpers |
| `apps/frontend/src/contexts/AuthContext.tsx` | Auth state + hasPermission |
| `apps/frontend/src/providers/AppProviders.tsx` | QueryClient + Auth + Intl providers |
| `apps/frontend/src/app/layout.tsx` | Root HTML shell |
| `apps/frontend/src/app/page.tsx` | Redirect → /dashboard |
| `apps/frontend/src/app/login/page.tsx` | Login page |
| `apps/frontend/src/app/(dashboard)/layout.tsx` | Sidebar + Header shell |
| `apps/frontend/src/app/(dashboard)/dashboard/page.tsx` | KPI + charts |
| `apps/frontend/src/app/(dashboard)/customers/page.tsx` | Customers table |
| `apps/frontend/src/app/(dashboard)/lenders/page.tsx` | Lenders table |
| `apps/frontend/src/app/(dashboard)/loans/page.tsx` | Loans table |
| `apps/frontend/src/app/(dashboard)/loans/[id]/page.tsx` | Loan detail + repayments |
| `apps/frontend/src/app/(dashboard)/repayments/page.tsx` | Repayments table |
| `apps/frontend/src/app/(dashboard)/users/page.tsx` | Users table |
| `apps/frontend/src/app/(dashboard)/user-groups/page.tsx` | User groups + permission matrix |
| `apps/frontend/src/components/layout/AppLayout.tsx` | Sider + Header layout |
| `apps/frontend/src/components/layout/Sidebar.tsx` | Nav menu items |
| `apps/frontend/src/components/layout/Header.tsx` | Logo, lang switcher, user menu |
| `apps/frontend/src/components/common/DataTable.tsx` | Ant Design Table wrapper |
| `apps/frontend/src/components/common/KPICard.tsx` | Stat card with trend |
| `apps/frontend/src/components/common/FormModal.tsx` | Modal + Form wrapper |
| `apps/frontend/src/components/common/PageHeader.tsx` | Title + breadcrumb + actions |
| `apps/frontend/src/components/common/PermissionGuard.tsx` | Hide/show by permission |
| `apps/frontend/src/components/common/LanguageSwitcher.tsx` | zh/en toggle |
| `apps/frontend/src/components/customers/CustomerForm.tsx` | Customer create/edit form |
| `apps/frontend/src/components/lenders/LenderForm.tsx` | Lender create/edit form |
| `apps/frontend/src/components/loans/LoanForm.tsx` | Multi-step loan form |
| `apps/frontend/src/components/loans/RepaymentTimeline.tsx` | Repayment history timeline |
| `apps/frontend/src/components/repayments/RepaymentForm.tsx` | Record repayment form |
| `apps/frontend/src/components/users/UserForm.tsx` | User create/edit form |
| `apps/frontend/src/components/user-groups/PermissionMatrix.tsx` | Checkbox matrix |
| `apps/frontend/src/hooks/useAuth.ts` | Auth React Query + context |
| `apps/frontend/src/hooks/useCustomers.ts` | Customer CRUD hooks |
| `apps/frontend/src/hooks/useLenders.ts` | Lender CRUD hooks |
| `apps/frontend/src/hooks/useLoans.ts` | Loan CRUD hooks |
| `apps/frontend/src/hooks/useRepayments.ts` | Repayment hooks |
| `apps/frontend/src/hooks/useUsers.ts` | User CRUD hooks |
| `apps/frontend/src/hooks/useUserGroups.ts` | User group CRUD hooks |
| `apps/frontend/src/hooks/useDashboard.ts` | KPI + chart data hooks |

---

## Task 17: Project Bootstrap & Configuration

**Files:**
- Create: `apps/frontend/package.json`
- Create: `apps/frontend/tsconfig.json`
- Create: `apps/frontend/next.config.ts`
- Create: `apps/frontend/tailwind.config.ts`
- Create: `apps/frontend/.env.local.example`
- Create: `apps/frontend/.env.local`

- [ ] **Step 1: Create apps/frontend/package.json**

```json
{
  "name": "@ck-loan/frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@ant-design/icons": "^5.3.7",
    "@ck-loan/shared": "*",
    "@tanstack/react-query": "^5.37.1",
    "@tanstack/react-query-devtools": "^5.37.1",
    "antd": "^5.17.0",
    "axios": "^1.7.2",
    "next": "14.2.3",
    "next-intl": "^3.14.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.12.7"
  },
  "devDependencies": {
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.5"
  }
}
```

- [ ] **Step 2: Create apps/frontend/tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@ck-loan/shared": ["../../packages/shared/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create apps/frontend/next.config.ts**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ck-loan/shared'],
  reactStrictMode: true,
};

export default nextConfig;
```

- [ ] **Step 4: Create apps/frontend/tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    // Prevent Tailwind's preflight from conflicting with Ant Design
    preflight: false,
  },
};

export default config;
```

- [ ] **Step 5: Create apps/frontend/src/app/globals.css**

```css
@tailwind utilities;

/* Override Ant Design primary color via CSS variable */
:root {
  --ant-primary-color: #1677ff;
}

body {
  margin: 0;
  padding: 0;
}
```

- [ ] **Step 6: Create apps/frontend/.env.local.example and .env.local**

`.env.local.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- [ ] **Step 7: Install dependencies**

```bash
cd apps/frontend && npm install
```

- [ ] **Step 8: Commit**

```bash
git add apps/frontend/package.json apps/frontend/tsconfig.json apps/frontend/next.config.ts apps/frontend/tailwind.config.ts apps/frontend/src/app/globals.css apps/frontend/.env.local.example
git commit -m "chore: bootstrap Next.js frontend with Ant Design, TanStack Query, Tailwind"
```

---

## Task 18: i18n — Messages & Provider

**Files:**
- Create: `apps/frontend/src/messages/zh.json`
- Create: `apps/frontend/src/messages/en.json`

- [ ] **Step 1: Create apps/frontend/src/messages/zh.json**

```json
{
  "nav": {
    "dashboard": "仪表板",
    "customers": "客户",
    "lenders": "贷款方",
    "loans": "贷款",
    "repayments": "还款",
    "users": "用户",
    "userGroups": "用户组",
    "logout": "退出登录"
  },
  "auth": {
    "login": "登录",
    "email": "电子邮件",
    "password": "密码",
    "loginButton": "登录",
    "loginTitle": "贷款管理系统",
    "loginSubtitle": "请登录您的账户",
    "invalidCredentials": "邮箱或密码错误"
  },
  "dashboard": {
    "title": "仪表板",
    "totalLoans": "贷款总数",
    "activeLoans": "活跃贷款",
    "completedLoans": "已完成",
    "defaultedLoans": "违约",
    "totalOutstanding": "未偿余额",
    "overdueCount": "逾期次数",
    "monthlyChart": "月度发放与还款",
    "statusChart": "贷款状态分布",
    "overdueTrend": "逾期趋势",
    "disbursed": "发放",
    "repaid": "还款"
  },
  "customers": {
    "title": "客户管理",
    "addCustomer": "新增客户",
    "editCustomer": "编辑客户",
    "fullName": "姓名",
    "phone": "电话",
    "email": "电子邮件",
    "address": "地址",
    "notes": "备注",
    "loanCount": "贷款数量",
    "deleteConfirm": "确定要删除此客户吗？"
  },
  "lenders": {
    "title": "贷款方管理",
    "addLender": "新增贷款方",
    "editLender": "编辑贷款方",
    "name": "名称",
    "availableCapital": "可用资金",
    "totalLent": "已贷总额",
    "deleteConfirm": "确定要删除此贷款方吗？"
  },
  "loans": {
    "title": "贷款管理",
    "addLoan": "新增贷款",
    "customer": "客户",
    "lender": "贷款方",
    "principal": "本金",
    "interestRate": "年利率 (%)",
    "tenureMonths": "期限 (月)",
    "repaymentFrequency": "还款频率",
    "interestModel": "利息模式",
    "totalRepayment": "应还总额",
    "installmentAmount": "每期还款",
    "status": "状态",
    "startDate": "开始日期",
    "statusActive": "活跃",
    "statusCompleted": "已完成",
    "statusDefaulted": "违约",
    "freqWeekly": "每周",
    "freqBiweekly": "每两周",
    "freqMonthly": "每月",
    "modelFlat": "固定利率",
    "modelReducing": "递减余额",
    "recordRepayment": "记录还款"
  },
  "repayments": {
    "title": "还款记录",
    "addRepayment": "记录还款",
    "paidAmount": "还款金额",
    "paidAt": "还款日期",
    "remainingBalance": "剩余余额",
    "overdueDays": "逾期天数",
    "notes": "备注"
  },
  "users": {
    "title": "用户管理",
    "addUser": "新增用户",
    "editUser": "编辑用户",
    "name": "姓名",
    "email": "电子邮件",
    "password": "密码",
    "userGroup": "用户组",
    "isActive": "是否激活",
    "deleteConfirm": "确定要删除此用户吗？"
  },
  "userGroups": {
    "title": "用户组管理",
    "addGroup": "新增用户组",
    "editGroup": "编辑用户组",
    "name": "组名称",
    "isSuperAdmin": "超级管理员",
    "permissions": "权限",
    "userCount": "用户数量",
    "modules": {
      "loans": "贷款",
      "customers": "客户",
      "lenders": "贷款方",
      "repayments": "还款",
      "users": "用户",
      "user-groups": "用户组"
    },
    "actions": {
      "create": "创建",
      "read": "查看",
      "update": "编辑",
      "delete": "删除"
    }
  },
  "common": {
    "save": "保存",
    "cancel": "取消",
    "edit": "编辑",
    "delete": "删除",
    "search": "搜索",
    "loading": "加载中...",
    "noData": "暂无数据",
    "actions": "操作",
    "createdAt": "创建时间",
    "yes": "是",
    "no": "否",
    "confirm": "确认",
    "success": "操作成功",
    "error": "操作失败",
    "total": "共 {count} 条"
  }
}
```

- [ ] **Step 2: Create apps/frontend/src/messages/en.json**

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "customers": "Customers",
    "lenders": "Lenders",
    "loans": "Loans",
    "repayments": "Repayments",
    "users": "Users",
    "userGroups": "User Groups",
    "logout": "Logout"
  },
  "auth": {
    "login": "Login",
    "email": "Email",
    "password": "Password",
    "loginButton": "Sign In",
    "loginTitle": "Loan Management System",
    "loginSubtitle": "Sign in to your account",
    "invalidCredentials": "Invalid email or password"
  },
  "dashboard": {
    "title": "Dashboard",
    "totalLoans": "Total Loans",
    "activeLoans": "Active Loans",
    "completedLoans": "Completed",
    "defaultedLoans": "Defaulted",
    "totalOutstanding": "Total Outstanding",
    "overdueCount": "Overdue Repayments",
    "monthlyChart": "Monthly Disbursement vs Repayment",
    "statusChart": "Loan Status Breakdown",
    "overdueTrend": "Overdue Trend",
    "disbursed": "Disbursed",
    "repaid": "Repaid"
  },
  "customers": {
    "title": "Customer Management",
    "addCustomer": "Add Customer",
    "editCustomer": "Edit Customer",
    "fullName": "Full Name",
    "phone": "Phone",
    "email": "Email",
    "address": "Address",
    "notes": "Notes",
    "loanCount": "Loans",
    "deleteConfirm": "Are you sure you want to delete this customer?"
  },
  "lenders": {
    "title": "Lender Management",
    "addLender": "Add Lender",
    "editLender": "Edit Lender",
    "name": "Name",
    "availableCapital": "Available Capital",
    "totalLent": "Total Lent",
    "deleteConfirm": "Are you sure you want to delete this lender?"
  },
  "loans": {
    "title": "Loan Management",
    "addLoan": "Add Loan",
    "customer": "Customer",
    "lender": "Lender",
    "principal": "Principal",
    "interestRate": "Annual Rate (%)",
    "tenureMonths": "Tenure (months)",
    "repaymentFrequency": "Repayment Frequency",
    "interestModel": "Interest Model",
    "totalRepayment": "Total Repayment",
    "installmentAmount": "Installment Amount",
    "status": "Status",
    "startDate": "Start Date",
    "statusActive": "Active",
    "statusCompleted": "Completed",
    "statusDefaulted": "Defaulted",
    "freqWeekly": "Weekly",
    "freqBiweekly": "Bi-weekly",
    "freqMonthly": "Monthly",
    "modelFlat": "Flat Rate",
    "modelReducing": "Reducing Balance",
    "recordRepayment": "Record Repayment"
  },
  "repayments": {
    "title": "Repayment Records",
    "addRepayment": "Record Repayment",
    "paidAmount": "Amount Paid",
    "paidAt": "Payment Date",
    "remainingBalance": "Remaining Balance",
    "overdueDays": "Overdue Days",
    "notes": "Notes"
  },
  "users": {
    "title": "User Management",
    "addUser": "Add User",
    "editUser": "Edit User",
    "name": "Name",
    "email": "Email",
    "password": "Password",
    "userGroup": "User Group",
    "isActive": "Active",
    "deleteConfirm": "Are you sure you want to delete this user?"
  },
  "userGroups": {
    "title": "User Group Management",
    "addGroup": "Add Group",
    "editGroup": "Edit Group",
    "name": "Group Name",
    "isSuperAdmin": "Super Admin",
    "permissions": "Permissions",
    "userCount": "Users",
    "modules": {
      "loans": "Loans",
      "customers": "Customers",
      "lenders": "Lenders",
      "repayments": "Repayments",
      "users": "Users",
      "user-groups": "User Groups"
    },
    "actions": {
      "create": "Create",
      "read": "Read",
      "update": "Update",
      "delete": "Delete"
    }
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "edit": "Edit",
    "delete": "Delete",
    "search": "Search",
    "loading": "Loading...",
    "noData": "No data",
    "actions": "Actions",
    "createdAt": "Created At",
    "yes": "Yes",
    "no": "No",
    "confirm": "Confirm",
    "success": "Operation successful",
    "error": "Operation failed",
    "total": "{count} total"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/messages/
git commit -m "feat: add zh/en i18n message files"
```

---

## Task 19: Auth Foundation (Axios + AuthContext)

**Files:**
- Create: `apps/frontend/src/lib/auth.ts`
- Create: `apps/frontend/src/lib/axios.ts`
- Create: `apps/frontend/src/contexts/AuthContext.tsx`
- Create: `apps/frontend/src/providers/AppProviders.tsx`

- [ ] **Step 1: Create apps/frontend/src/lib/auth.ts**

```typescript
// In-memory token store — never touches localStorage/sessionStorage
let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string): void => {
  accessToken = token;
};

export const clearAuth = (): void => {
  accessToken = null;
};
```

- [ ] **Step 2: Create apps/frontend/src/lib/axios.ts**

```typescript
import axios from 'axios';
import { getAccessToken, setAccessToken, clearAuth } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Queue of failed requests waiting for token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) =>
          failedQueue.push({ resolve, reject }),
        ).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken: string = res.data.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
```

- [ ] **Step 3: Create apps/frontend/src/contexts/AuthContext.tsx**

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { setAccessToken, clearAuth } from '@/lib/auth';
import api from '@/lib/axios';

export interface UserGroup {
  id: string;
  name: string;
  isSuperAdmin: boolean;
  permissions: Array<{ module: string; action: string }>;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  userGroup: UserGroup | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: attempt to restore session via refresh token cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const { accessToken, user: authUser } = res.data.data;
        setAccessToken(accessToken);
        setUser(authUser);
      } catch {
        // No valid session — stay logged out
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user: authUser } = res.data.data;
    setAccessToken(accessToken);
    setUser(authUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (module: string, action: string): boolean => {
      if (!user?.userGroup) return false;
      if (user.userGroup.isSuperAdmin) return true;
      return user.userGroup.permissions.some(
        (p) => p.module === module && p.action === action,
      );
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
```

- [ ] **Step 4: Create apps/frontend/src/providers/AppProviders.tsx**

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NextIntlClientProvider } from 'next-intl';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { AuthProvider } from '@/contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export type Locale = 'zh' | 'en';

const LOCALE_KEY = 'ck_loan_locale';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('zh');
  const [messages, setMessages] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const stored = (localStorage.getItem(LOCALE_KEY) as Locale) || 'zh';
    setLocale(stored);
  }, []);

  useEffect(() => {
    import(`@/messages/${locale}.json`).then((m) => setMessages(m.default));
    localStorage.setItem(LOCALE_KEY, locale);
  }, [locale]);

  const antLocale = locale === 'zh' ? zhCN : enUS;

  return (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ConfigProvider
          locale={antLocale}
          theme={{
            token: {
              colorPrimary: '#1677ff',
              borderRadius: 8,
              fontFamily:
                locale === 'zh'
                  ? '"PingFang SC", "Microsoft YaHei", sans-serif'
                  : 'Inter, sans-serif',
            },
          }}
        >
          <AntApp>
            <AuthProvider>
              {/* Expose locale setter via context — consumed by LanguageSwitcher */}
              <LocaleContext.Provider value={{ locale, setLocale }}>
                {children}
              </LocaleContext.Provider>
            </AuthProvider>
          </AntApp>
        </ConfigProvider>
      </NextIntlClientProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export const LocaleContext = React.createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
}>({ locale: 'zh', setLocale: () => {} });

export const useLocale = () => React.useContext(LocaleContext);
```

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/lib/ apps/frontend/src/contexts/ apps/frontend/src/providers/
git commit -m "feat: add auth context, axios interceptors, and app providers"
```

---

## Task 20: Root Layout & Login Page

**Files:**
- Create: `apps/frontend/src/app/layout.tsx`
- Create: `apps/frontend/src/app/page.tsx`
- Create: `apps/frontend/src/app/login/page.tsx`

- [ ] **Step 1: Create apps/frontend/src/app/layout.tsx**

```typescript
import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/providers/AppProviders';

export const metadata: Metadata = {
  title: '贷款管理系统 | Loan Management System',
  description: 'Professional loan management admin dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create apps/frontend/src/app/page.tsx**

```typescript
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/dashboard');
}
```

- [ ] **Step 3: Create apps/frontend/src/app/login/page.tsx**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Typography, App } from 'antd';
import { LockOutlined, MailOutlined, BankOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;

export default function LoginPage() {
  const t = useTranslations('auth');
  const { login } = useAuth();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      router.push('/dashboard');
    } catch {
      message.error(t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{ width: 420, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        styles={{ body: { padding: 40 } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <BankOutlined style={{ fontSize: 48, color: '#1677ff' }} />
          <Title level={3} style={{ marginTop: 12, marginBottom: 4 }}>
            {t('loginTitle')}
          </Title>
          <Text type="secondary">{t('loginSubtitle')}</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input prefix={<MailOutlined />} placeholder={t('email')} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t('password')} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ height: 44, borderRadius: 8 }}
            >
              {t('loginButton')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/app/
git commit -m "feat: add root layout, redirect, and login page"
```

---

## Task 21: Common Reusable Components

**Files:**
- Create: `apps/frontend/src/components/common/LanguageSwitcher.tsx`
- Create: `apps/frontend/src/components/common/PermissionGuard.tsx`
- Create: `apps/frontend/src/components/common/KPICard.tsx`
- Create: `apps/frontend/src/components/common/DataTable.tsx`
- Create: `apps/frontend/src/components/common/FormModal.tsx`
- Create: `apps/frontend/src/components/common/PageHeader.tsx`

- [ ] **Step 1: Create apps/frontend/src/components/common/LanguageSwitcher.tsx**

```typescript
'use client';

import { Segmented } from 'antd';
import { useLocale } from '@/providers/AppProviders';
import type { Locale } from '@/providers/AppProviders';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <Segmented
      value={locale}
      onChange={(val) => setLocale(val as Locale)}
      options={[
        { label: '中文', value: 'zh' },
        { label: 'EN', value: 'en' },
      ]}
      size="small"
    />
  );
}
```

- [ ] **Step 2: Create apps/frontend/src/components/common/PermissionGuard.tsx**

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';

interface PermissionGuardProps {
  module: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  module,
  action,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(module, action)) return <>{fallback}</>;
  return <>{children}</>;
}
```

- [ ] **Step 3: Create apps/frontend/src/components/common/KPICard.tsx**

```typescript
'use client';

import { Card, Statistic, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Text } = Typography;

interface KPICardProps {
  title: string;
  value: string | number;
  prefix?: ReactNode;
  suffix?: string;
  color?: string;
  icon?: ReactNode;
  loading?: boolean;
}

export function KPICard({
  title,
  value,
  prefix,
  suffix,
  color = '#1677ff',
  icon,
  loading = false,
}: KPICardProps) {
  return (
    <Card
      loading={loading}
      style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {title}
          </Text>
          <Statistic
            value={value}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{ color, fontSize: 28, fontWeight: 700, lineHeight: 1.3 }}
            style={{ marginTop: 4 }}
          />
        </div>
        {icon && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `${color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              color,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: Create apps/frontend/src/components/common/DataTable.tsx**

```typescript
'use client';

import { Table, Input, Space, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import type { TableProps } from 'antd';
import { useState } from 'react';

interface DataTableProps<T> extends TableProps<T> {
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  toolbarRight?: React.ReactNode;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
}

export function DataTable<T extends object>({
  onSearch,
  searchPlaceholder,
  toolbarRight,
  total,
  page = 1,
  pageSize = 20,
  onPageChange,
  ...tableProps
}: DataTableProps<T>) {
  const t = useTranslations('common');
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <div>
      {(onSearch || toolbarRight) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            gap: 12,
          }}
        >
          <Space>
            {onSearch && (
              <Input.Search
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={handleSearch}
                placeholder={searchPlaceholder || t('search')}
                allowClear
                style={{ width: 280 }}
                prefix={<SearchOutlined />}
              />
            )}
          </Space>
          <Space>{toolbarRight}</Space>
        </div>
      )}

      <Table
        {...tableProps}
        locale={{
          emptyText: (
            <Empty description={t('noData')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ),
        }}
        pagination={
          total !== undefined
            ? {
                current: page,
                pageSize,
                total,
                onChange: onPageChange,
                showSizeChanger: true,
                showTotal: (tot) => t('total', { count: tot }),
              }
            : tableProps.pagination
        }
        style={{ borderRadius: 8, overflow: 'hidden' }}
      />
    </div>
  );
}
```

- [ ] **Step 5: Create apps/frontend/src/components/common/FormModal.tsx**

```typescript
'use client';

import { Modal, Form, Button, Space } from 'antd';
import { useTranslations } from 'next-intl';
import type { FormInstance } from 'antd';
import type { ReactNode } from 'react';

interface FormModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (values: unknown) => Promise<void>;
  form: FormInstance;
  children: ReactNode;
  loading?: boolean;
  width?: number;
}

export function FormModal({
  open,
  title,
  onClose,
  onSubmit,
  form,
  children,
  loading = false,
  width = 560,
}: FormModalProps) {
  const t = useTranslations('common');

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={title}
      onCancel={handleClose}
      width={width}
      footer={
        <Space>
          <Button onClick={handleClose}>{t('cancel')}</Button>
          <Button type="primary" loading={loading} onClick={handleOk}>
            {t('save')}
          </Button>
        </Space>
      }
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
      >
        {children}
      </Form>
    </Modal>
  );
}
```

- [ ] **Step 6: Create apps/frontend/src/components/common/PageHeader.tsx**

```typescript
'use client';

import { Typography, Space } from 'antd';
import type { ReactNode } from 'react';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}
    >
      <Title level={4} style={{ margin: 0 }}>
        {title}
      </Title>
      {actions && <Space>{actions}</Space>}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/src/components/common/
git commit -m "feat: add reusable DataTable, KPICard, FormModal, PermissionGuard, LanguageSwitcher"
```

---

## Task 22: Layout Components (Sidebar + Header)

**Files:**
- Create: `apps/frontend/src/components/layout/Sidebar.tsx`
- Create: `apps/frontend/src/components/layout/Header.tsx`
- Create: `apps/frontend/src/components/layout/AppLayout.tsx`
- Create: `apps/frontend/src/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Create apps/frontend/src/components/layout/Sidebar.tsx**

```typescript
'use client';

import { Menu } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  BankOutlined,
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: t('dashboard') },
    { key: '/customers', icon: <TeamOutlined />, label: t('customers') },
    { key: '/lenders', icon: <BankOutlined />, label: t('lenders') },
    { key: '/loans', icon: <FileTextOutlined />, label: t('loans') },
    { key: '/repayments', icon: <DollarOutlined />, label: t('repayments') },
    {
      key: 'admin',
      icon: <SettingOutlined />,
      label: '管理',
      children: [
        { key: '/users', icon: <UserOutlined />, label: t('users') },
        { key: '/user-groups', icon: <SettingOutlined />, label: t('userGroups') },
      ],
    },
  ];

  const selectedKey =
    menuItems
      .flatMap((item) => ('children' in item ? item.children ?? [] : [item]))
      .find((item) => pathname.startsWith(item.key))?.key || '/dashboard';

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      defaultOpenKeys={['admin']}
      items={menuItems}
      onClick={({ key }) => router.push(key)}
      style={{ height: '100%', borderRight: 0, paddingTop: 8 }}
    />
  );
}
```

- [ ] **Step 2: Create apps/frontend/src/components/layout/Header.tsx**

```typescript
'use client';

import { Layout, Space, Avatar, Dropdown, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, BankOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export function Header() {
  const t = useTranslations('nav');
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const dropdownItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('logout'),
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Space>
        <BankOutlined style={{ fontSize: 22, color: '#1677ff' }} />
        <Text strong style={{ fontSize: 16 }}>
          LoanAdmin
        </Text>
      </Space>

      <Space size={16}>
        <LanguageSwitcher />
        <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              size={32}
              icon={<UserOutlined />}
              style={{ background: '#1677ff' }}
            />
            <Text>{user?.name}</Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
```

- [ ] **Step 3: Create apps/frontend/src/components/layout/AppLayout.tsx**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Layout, Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';

const { Sider, Content } = Layout;

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={220}
          style={{
            background: '#fff',
            boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
            overflow: 'auto',
            height: '100vh',
            position: 'sticky',
            top: 0,
            left: 0,
          }}
        >
          <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
            {!collapsed && <span style={{ fontWeight: 700, color: '#1677ff', fontSize: 15 }}>LoanAdmin</span>}
          </div>
          <Sidebar />
        </Sider>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          width={240}
          styles={{ body: { padding: 0 } }}
        >
          <Sidebar />
        </Drawer>
      )}

      <Layout>
        <div style={{ position: 'relative' }}>
          {isMobile && (
            <Button
              icon={<MenuOutlined />}
              onClick={() => setMobileOpen(true)}
              style={{ position: 'absolute', left: 16, top: 12, zIndex: 10 }}
            />
          )}
          <Header />
        </div>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: '#fff',
            borderRadius: 12,
            minHeight: 360,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
```

- [ ] **Step 4: Create apps/frontend/src/app/(dashboard)/layout.tsx**

```typescript
import { AppLayout } from '@/components/layout/AppLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/components/layout/ apps/frontend/src/app/\(dashboard\)/layout.tsx
git commit -m "feat: add app layout with responsive sidebar, header, and auth guard"
```

---

## Task 23: React Query Hooks

**Files:**
- Create: `apps/frontend/src/hooks/useDashboard.ts`
- Create: `apps/frontend/src/hooks/useCustomers.ts`
- Create: `apps/frontend/src/hooks/useLenders.ts`
- Create: `apps/frontend/src/hooks/useLoans.ts`
- Create: `apps/frontend/src/hooks/useRepayments.ts`
- Create: `apps/frontend/src/hooks/useUsers.ts`
- Create: `apps/frontend/src/hooks/useUserGroups.ts`

- [ ] **Step 1: Create apps/frontend/src/hooks/useDashboard.ts**

```typescript
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { KpiData, ChartData } from '@ck-loan/shared';

export const useDashboardKpis = () =>
  useQuery<KpiData>({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async () => {
      const res = await api.get('/dashboard/kpis');
      return res.data.data;
    },
  });

export const useDashboardCharts = () =>
  useQuery<ChartData>({
    queryKey: ['dashboard', 'charts'],
    queryFn: async () => {
      const res = await api.get('/dashboard/charts');
      return res.data.data;
    },
  });
```

- [ ] **Step 2: Create apps/frontend/src/hooks/useCustomers.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import api from '@/lib/axios';

interface CustomerQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const useCustomers = (query: CustomerQuery = {}) =>
  useQuery({
    queryKey: ['customers', query],
    queryFn: async () => {
      const res = await api.get('/customers', { params: query });
      return res.data.data;
    },
  });

export const useCustomer = (id: string) =>
  useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      const res = await api.get(`/customers/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/customers', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      message.success('客户创建成功 / Customer created');
    },
    onError: () => message.error('操作失败 / Operation failed'),
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      api.patch(`/customers/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      message.success('客户更新成功 / Customer updated');
    },
    onError: () => message.error('操作失败 / Operation failed'),
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      message.success('客户已删除 / Customer deleted');
    },
    onError: () => message.error('操作失败 / Operation failed'),
  });
};
```

- [ ] **Step 3: Create apps/frontend/src/hooks/useLenders.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import api from '@/lib/axios';

interface LenderQuery { page?: number; limit?: number; search?: string; }

export const useLenders = (query: LenderQuery = {}) =>
  useQuery({
    queryKey: ['lenders', query],
    queryFn: async () => {
      const res = await api.get('/lenders', { params: query });
      return res.data.data;
    },
  });

export const useCreateLender = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/lenders', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lenders'] }); message.success('贷款方已创建'); },
    onError: () => message.error('操作失败'),
  });
};

export const useUpdateLender = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.patch(`/lenders/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lenders'] }); message.success('贷款方已更新'); },
    onError: () => message.error('操作失败'),
  });
};

export const useDeleteLender = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/lenders/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lenders'] }); message.success('贷款方已删除'); },
    onError: () => message.error('操作失败'),
  });
};
```

- [ ] **Step 4: Create apps/frontend/src/hooks/useLoans.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import api from '@/lib/axios';

interface LoanQuery {
  page?: number; limit?: number; search?: string;
  status?: string; lenderId?: string; customerId?: string;
}

export const useLoans = (query: LoanQuery = {}) =>
  useQuery({
    queryKey: ['loans', query],
    queryFn: async () => {
      const res = await api.get('/loans', { params: query });
      return res.data.data;
    },
  });

export const useLoan = (id: string) =>
  useQuery({
    queryKey: ['loans', id],
    queryFn: async () => {
      const res = await api.get(`/loans/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

export const useCreateLoan = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/loans', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['loans'] }); qc.invalidateQueries({ queryKey: ['lenders'] }); message.success('贷款已创建'); },
    onError: (err: any) => message.error(err?.response?.data?.message || '操作失败'),
  });
};

export const useUpdateLoan = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.patch(`/loans/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['loans'] }); message.success('贷款已更新'); },
    onError: () => message.error('操作失败'),
  });
};
```

- [ ] **Step 5: Create apps/frontend/src/hooks/useRepayments.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import api from '@/lib/axios';

interface RepaymentQuery { page?: number; limit?: number; loanId?: string; }

export const useRepayments = (query: RepaymentQuery = {}) =>
  useQuery({
    queryKey: ['repayments', query],
    queryFn: async () => {
      const res = await api.get('/repayments', { params: query });
      return res.data.data;
    },
  });

export const useCreateRepayment = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/repayments', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repayments'] });
      qc.invalidateQueries({ queryKey: ['loans'] });
      message.success('还款记录已添加');
    },
    onError: (err: any) => message.error(err?.response?.data?.message || '操作失败'),
  });
};
```

- [ ] **Step 6: Create apps/frontend/src/hooks/useUsers.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import api from '@/lib/axios';

interface UserQuery { page?: number; limit?: number; search?: string; }

export const useUsers = (query: UserQuery = {}) =>
  useQuery({
    queryKey: ['users', query],
    queryFn: async () => {
      const res = await api.get('/users', { params: query });
      return res.data.data;
    },
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/users', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); message.success('用户已创建'); },
    onError: (err: any) => message.error(err?.response?.data?.message || '操作失败'),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.patch(`/users/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); message.success('用户已更新'); },
    onError: () => message.error('操作失败'),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); message.success('用户已删除'); },
    onError: () => message.error('操作失败'),
  });
};
```

- [ ] **Step 7: Create apps/frontend/src/hooks/useUserGroups.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import api from '@/lib/axios';

export const useUserGroups = (query: { page?: number; limit?: number } = {}) =>
  useQuery({
    queryKey: ['user-groups', query],
    queryFn: async () => {
      const res = await api.get('/user-groups', { params: query });
      return res.data.data;
    },
  });

export const useUserGroup = (id: string) =>
  useQuery({
    queryKey: ['user-groups', id],
    queryFn: async () => {
      const res = await api.get(`/user-groups/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

export const useCreateUserGroup = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/user-groups', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-groups'] }); message.success('用户组已创建'); },
    onError: () => message.error('操作失败'),
  });
};

export const useUpdateUserGroup = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.patch(`/user-groups/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-groups'] }); message.success('用户组已更新'); },
    onError: () => message.error('操作失败'),
  });
};

export const useDeleteUserGroup = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/user-groups/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-groups'] }); message.success('用户组已删除'); },
    onError: () => message.error('操作失败'),
  });
};
```

- [ ] **Step 8: Commit**

```bash
git add apps/frontend/src/hooks/
git commit -m "feat: add TanStack Query hooks for all API modules"
```

---

## Task 24: Dashboard Page

**Files:**
- Create: `apps/frontend/src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Create apps/frontend/src/app/(dashboard)/dashboard/page.tsx**

```typescript
'use client';

import { Row, Col, Card, Skeleton } from 'antd';
import {
  FileTextOutlined, CheckCircleOutlined, WarningOutlined,
  DollarOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useTranslations } from 'next-intl';
import { KPICard } from '@/components/common/KPICard';
import { PageHeader } from '@/components/common/PageHeader';
import { useDashboardKpis, useDashboardCharts } from '@/hooks/useDashboard';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#1677ff',
  COMPLETED: '#52c41a',
  DEFAULTED: '#ff4d4f',
};

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { data: kpis, isLoading: kpisLoading } = useDashboardKpis();
  const { data: charts, isLoading: chartsLoading } = useDashboardCharts();

  return (
    <div>
      <PageHeader title={t('title')} />

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <KPICard
            title={t('totalLoans')}
            value={kpis?.totalLoans ?? 0}
            icon={<FileTextOutlined />}
            loading={kpisLoading}
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <KPICard
            title={t('activeLoans')}
            value={kpis?.activeLoans ?? 0}
            icon={<ClockCircleOutlined />}
            color="#1677ff"
            loading={kpisLoading}
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <KPICard
            title={t('totalOutstanding')}
            value={kpis ? `RM ${Number(kpis.totalOutstanding).toLocaleString()}` : '—'}
            icon={<DollarOutlined />}
            color="#722ed1"
            loading={kpisLoading}
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <KPICard
            title={t('overdueCount')}
            value={kpis?.overdueCount ?? 0}
            icon={<ExclamationCircleOutlined />}
            color="#ff4d4f"
            loading={kpisLoading}
          />
        </Col>
      </Row>

      {/* Row 2: Completed + Defaulted */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <KPICard
            title={t('completedLoans')}
            value={kpis?.completedLoans ?? 0}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
            loading={kpisLoading}
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <KPICard
            title={t('defaultedLoans')}
            value={kpis?.defaultedLoans ?? 0}
            icon={<WarningOutlined />}
            color="#fa8c16"
            loading={kpisLoading}
          />
        </Col>
      </Row>

      {/* Charts Row 1: Monthly bar chart + Status pie */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card title={t('monthlyChart')} style={{ borderRadius: 12 }}>
            {chartsLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={charts?.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `RM ${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="disbursed" name={t('disbursed')} fill="#1677ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="repaid" name={t('repaid')} fill="#52c41a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={t('statusChart')} style={{ borderRadius: 12 }}>
            {chartsLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={charts?.statusBreakdown || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ status, percent }) =>
                      `${status} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {charts?.statusBreakdown.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#ccc'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2: Overdue trend line */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title={t('overdueTrend')} style={{ borderRadius: 12 }}>
            {chartsLoading ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={charts?.overdueTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="overdue"
                    stroke="#ff4d4f"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/app/\(dashboard\)/dashboard/
git commit -m "feat: implement dashboard page with KPI cards and 4 charts"
```

---

## Task 25: Customers, Lenders, and Repayments Pages

**Files:**
- Create: `apps/frontend/src/app/(dashboard)/customers/page.tsx`
- Create: `apps/frontend/src/app/(dashboard)/lenders/page.tsx`
- Create: `apps/frontend/src/app/(dashboard)/repayments/page.tsx`

- [ ] **Step 1: Create apps/frontend/src/app/(dashboard)/customers/page.tsx**

```typescript
'use client';

import { useState } from 'react';
import { Button, Form, Input, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import { PageHeader } from '@/components/common/PageHeader';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import {
  useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer,
} from '@/hooks/useCustomers';

export default function CustomersPage() {
  const t = useTranslations('customers');
  const tc = useTranslations('common');
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading } = useCustomers({ page, limit: 20, search });
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const openCreate = () => { form.resetFields(); setEditId(null); setModalOpen(true); };
  const openEdit = (record: any) => {
    form.setFieldsValue(record);
    setEditId(record.id);
    setModalOpen(true);
  };

  const handleSubmit = async (values: unknown) => {
    if (editId) {
      await updateMutation.mutateAsync({ id: editId, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setModalOpen(false);
    form.resetFields();
  };

  const columns = [
    { title: t('fullName'), dataIndex: 'fullName', key: 'fullName', sorter: true },
    { title: t('phone'), dataIndex: 'phone', key: 'phone' },
    { title: t('email'), dataIndex: 'email', key: 'email', render: (v: string) => v || '—' },
    { title: t('address'), dataIndex: 'address', key: 'address', ellipsis: true, render: (v: string) => v || '—' },
    {
      title: t('loanCount'),
      dataIndex: ['_count', 'loans'],
      key: 'loanCount',
      render: (v: number) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: tc('actions'),
      key: 'actions',
      width: 120,
      render: (_: unknown, record: any) => (
        <>
          <PermissionGuard module="customers" action="update">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </PermissionGuard>
          <PermissionGuard module="customers" action="delete">
            <Popconfirm title={t('deleteConfirm')} onConfirm={() => deleteMutation.mutate(record.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </PermissionGuard>
        </>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('title')}
        actions={
          <PermissionGuard module="customers" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t('addCustomer')}
            </Button>
          </PermissionGuard>
        }
      />

      <DataTable
        columns={columns}
        dataSource={data?.items || []}
        rowKey="id"
        loading={isLoading}
        onSearch={setSearch}
        total={data?.total}
        page={page}
        pageSize={20}
        onPageChange={(p) => setPage(p)}
      />

      <FormModal
        open={modalOpen}
        title={editId ? t('editCustomer') : t('addCustomer')}
        form={form}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      >
        <Form.Item name="fullName" label={t('fullName')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label={t('phone')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label={t('email')} rules={[{ type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label={t('address')}>
          <Input />
        </Form.Item>
        <Form.Item name="notes" label={t('notes')}>
          <Input.TextArea rows={3} />
        </Form.Item>
      </FormModal>
    </div>
  );
}
```

- [ ] **Step 2: Create apps/frontend/src/app/(dashboard)/lenders/page.tsx**

```typescript
'use client';

import { useState } from 'react';
import { Button, Form, Input, InputNumber, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import { PageHeader } from '@/components/common/PageHeader';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useLenders, useCreateLender, useUpdateLender, useDeleteLender } from '@/hooks/useLenders';

const fmtMoney = (v: string) => `RM ${Number(v).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;

export default function LendersPage() {
  const t = useTranslations('lenders');
  const tc = useTranslations('common');
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading } = useLenders({ page, limit: 20, search });
  const createMutation = useCreateLender();
  const updateMutation = useUpdateLender();
  const deleteMutation = useDeleteLender();

  const openCreate = () => { form.resetFields(); setEditId(null); setModalOpen(true); };
  const openEdit = (record: any) => {
    form.setFieldsValue({ name: record.name, availableCapital: Number(record.availableCapital) });
    setEditId(record.id);
    setModalOpen(true);
  };

  const handleSubmit = async (values: unknown) => {
    if (editId) {
      await updateMutation.mutateAsync({ id: editId, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setModalOpen(false);
  };

  const columns = [
    { title: t('name'), dataIndex: 'name', key: 'name' },
    { title: t('availableCapital'), dataIndex: 'availableCapital', key: 'availableCapital', render: fmtMoney },
    { title: t('totalLent'), dataIndex: 'totalLent', key: 'totalLent', render: fmtMoney },
    {
      title: tc('actions'), key: 'actions', width: 120,
      render: (_: unknown, record: any) => (
        <>
          <PermissionGuard module="lenders" action="update">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </PermissionGuard>
          <PermissionGuard module="lenders" action="delete">
            <Popconfirm title={t('deleteConfirm')} onConfirm={() => deleteMutation.mutate(record.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </PermissionGuard>
        </>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('title')}
        actions={
          <PermissionGuard module="lenders" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('addLender')}</Button>
          </PermissionGuard>
        }
      />
      <DataTable
        columns={columns} dataSource={data?.items || []} rowKey="id"
        loading={isLoading} onSearch={setSearch} total={data?.total}
        page={page} pageSize={20} onPageChange={(p) => setPage(p)}
      />
      <FormModal
        open={modalOpen} title={editId ? t('editLender') : t('addLender')}
        form={form} onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      >
        <Form.Item name="name" label={t('name')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="availableCapital" label={t('availableCapital')} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} prefix="RM" />
        </Form.Item>
      </FormModal>
    </div>
  );
}
```

- [ ] **Step 3: Create apps/frontend/src/app/(dashboard)/repayments/page.tsx**

```typescript
'use client';

import { useState } from 'react';
import { Tag } from 'antd';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { useRepayments } from '@/hooks/useRepayments';

const fmtMoney = (v: string) => `RM ${Number(v).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;
const fmtDate = (v: string) => new Date(v).toLocaleDateString('zh-CN');

export default function RepaymentsPage() {
  const t = useTranslations('repayments');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useRepayments({ page, limit: 20 });

  const columns = [
    {
      title: '客户 / Customer',
      key: 'customer',
      render: (_: unknown, record: any) => record.loan?.customer?.fullName || '—',
    },
    { title: t('paidAmount'), dataIndex: 'paidAmount', key: 'paidAmount', render: fmtMoney },
    { title: t('paidAt'), dataIndex: 'paidAt', key: 'paidAt', render: fmtDate },
    { title: t('remainingBalance'), dataIndex: 'remainingBalance', key: 'remainingBalance', render: fmtMoney },
    {
      title: t('overdueDays'),
      dataIndex: 'overdueDays',
      key: 'overdueDays',
      render: (v: number) => v > 0 ? <Tag color="red">{v} 天</Tag> : <Tag color="green">准时</Tag>,
    },
    { title: t('notes'), dataIndex: 'notes', key: 'notes', render: (v: string) => v || '—' },
  ];

  return (
    <div>
      <PageHeader title={t('title')} />
      <DataTable
        columns={columns}
        dataSource={data?.items || []}
        rowKey="id"
        loading={isLoading}
        total={data?.total}
        page={page}
        pageSize={20}
        onPageChange={(p) => setPage(p)}
        rowClassName={(record: any) => record.overdueDays > 0 ? 'ant-table-row-danger' : ''}
      />
      <style>{`.ant-table-row-danger td { background: #fff2f0 !important; }`}</style>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/app/\(dashboard\)/customers/ apps/frontend/src/app/\(dashboard\)/lenders/ apps/frontend/src/app/\(dashboard\)/repayments/
git commit -m "feat: implement customers, lenders, and repayments pages"
```

---

## Task 26: Loans Pages

**Files:**
- Create: `apps/frontend/src/app/(dashboard)/loans/page.tsx`
- Create: `apps/frontend/src/app/(dashboard)/loans/[id]/page.tsx`

- [ ] **Step 1: Create apps/frontend/src/app/(dashboard)/loans/page.tsx**

```typescript
'use client';

import { useState } from 'react';
import { Button, Form, Select, InputNumber, DatePicker, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import { PageHeader } from '@/components/common/PageHeader';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useLoans, useCreateLoan } from '@/hooks/useLoans';
import { useCustomers } from '@/hooks/useCustomers';
import { useLenders } from '@/hooks/useLenders';
import { RepaymentFrequency, InterestModel, LoanStatus } from '@ck-loan/shared';

const fmtMoney = (v: string) => `RM ${Number(v).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'blue', COMPLETED: 'green', DEFAULTED: 'red',
};

export default function LoansPage() {
  const t = useTranslations('loans');
  const tc = useTranslations('common');
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useLoans({ page, limit: 20, status: statusFilter });
  const { data: customers } = useCustomers({ limit: 200 });
  const { data: lenders } = useLenders({ limit: 200 });
  const createMutation = useCreateLoan();

  const handleSubmit = async (values: any) => {
    await createMutation.mutateAsync({
      ...values,
      startDate: values.startDate.format('YYYY-MM-DD'),
    });
    setModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: t('customer'), key: 'customer',
      render: (_: unknown, r: any) => (
        <Link href={`/loans/${r.id}`}>{r.customer?.fullName}</Link>
      ),
    },
    { title: t('lender'), key: 'lender', render: (_: unknown, r: any) => r.lender?.name },
    { title: t('principal'), dataIndex: 'principal', key: 'principal', render: fmtMoney },
    { title: t('interestRate'), dataIndex: 'interestRate', key: 'interestRate', render: (v: string) => `${v}%` },
    { title: t('tenureMonths'), dataIndex: 'tenureMonths', key: 'tenureMonths', render: (v: number) => `${v}M` },
    { title: t('installmentAmount'), dataIndex: 'installmentAmount', key: 'installmentAmount', render: fmtMoney },
    {
      title: t('status'), dataIndex: 'status', key: 'status',
      render: (v: LoanStatus) => <Tag color={STATUS_COLOR[v]}>{t(`status${v.charAt(0) + v.slice(1).toLowerCase()}` as any)}</Tag>,
    },
    {
      title: tc('actions'), key: 'actions', width: 80,
      render: (_: unknown, r: any) => <Link href={`/loans/${r.id}`}><Button type="link" size="small">详情</Button></Link>,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('title')}
        actions={
          <>
            <Select
              allowClear
              placeholder={t('status')}
              style={{ width: 140 }}
              onChange={(v) => setStatusFilter(v)}
              options={[
                { label: t('statusActive'), value: 'ACTIVE' },
                { label: t('statusCompleted'), value: 'COMPLETED' },
                { label: t('statusDefaulted'), value: 'DEFAULTED' },
              ]}
            />
            <PermissionGuard module="loans" action="create">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                {t('addLoan')}
              </Button>
            </PermissionGuard>
          </>
        }
      />

      <DataTable
        columns={columns} dataSource={data?.items || []} rowKey="id"
        loading={isLoading} total={data?.total}
        page={page} pageSize={20} onPageChange={(p) => setPage(p)}
      />

      <FormModal
        open={modalOpen} title={t('addLoan')} form={form}
        onClose={() => setModalOpen(false)} onSubmit={handleSubmit}
        loading={createMutation.isPending} width={640}
      >
        <Form.Item name="customerId" label={t('customer')} rules={[{ required: true }]}>
          <Select
            showSearch optionFilterProp="label"
            options={customers?.items?.map((c: any) => ({ label: c.fullName, value: c.id }))}
          />
        </Form.Item>
        <Form.Item name="lenderId" label={t('lender')} rules={[{ required: true }]}>
          <Select
            showSearch optionFilterProp="label"
            options={lenders?.items?.map((l: any) => ({ label: `${l.name} (RM ${Number(l.availableCapital).toLocaleString()})`, value: l.id }))}
          />
        </Form.Item>
        <Form.Item name="principal" label={t('principal')} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={1} prefix="RM" />
        </Form.Item>
        <Form.Item name="interestRate" label={t('interestRate')} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0.1} max={100} step={0.1} suffix="%" />
        </Form.Item>
        <Form.Item name="tenureMonths" label={t('tenureMonths')} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={1} max={360} />
        </Form.Item>
        <Form.Item name="repaymentFrequency" label={t('repaymentFrequency')} rules={[{ required: true }]}>
          <Select options={[
            { label: t('freqWeekly'), value: RepaymentFrequency.WEEKLY },
            { label: t('freqBiweekly'), value: RepaymentFrequency.BIWEEKLY },
            { label: t('freqMonthly'), value: RepaymentFrequency.MONTHLY },
          ]} />
        </Form.Item>
        <Form.Item name="interestModel" label={t('interestModel')} rules={[{ required: true }]}>
          <Select options={[
            { label: t('modelFlat'), value: InterestModel.FLAT },
            { label: t('modelReducing'), value: InterestModel.REDUCING },
          ]} />
        </Form.Item>
        <Form.Item name="startDate" label={t('startDate')} rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </FormModal>
    </div>
  );
}
```

- [ ] **Step 2: Create apps/frontend/src/app/(dashboard)/loans/[id]/page.tsx**

```typescript
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Card, Row, Col, Tag, Descriptions, Timeline, Button,
  Form, InputNumber, DatePicker, Input, Modal, Skeleton,
} from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLoan } from '@/hooks/useLoans';
import { useCreateRepayment } from '@/hooks/useRepayments';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { LoanStatus } from '@ck-loan/shared';

const fmtMoney = (v: string | number) =>
  `RM ${Number(v).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;
const fmtDate = (v: string) => new Date(v).toLocaleDateString('zh-CN');

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'blue', COMPLETED: 'green', DEFAULTED: 'red',
};

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('loans');
  const tr = useTranslations('repayments');
  const [form] = Form.useForm();
  const [repayModalOpen, setRepayModalOpen] = useState(false);

  const { data: loan, isLoading } = useLoan(id);
  const createRepayment = useCreateRepayment();

  const handleRepayment = async (values: any) => {
    await createRepayment.mutateAsync({
      loanId: id,
      paidAmount: values.paidAmount,
      paidAt: values.paidAt.format('YYYY-MM-DD'),
      overdueDays: values.overdueDays || 0,
      notes: values.notes,
    });
    setRepayModalOpen(false);
    form.resetFields();
  };

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (!loan) return <div>Loan not found</div>;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link href="/loans">
          <Button icon={<ArrowLeftOutlined />} type="link" style={{ paddingLeft: 0 }}>
            返回贷款列表
          </Button>
        </Link>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={`贷款详情 — ${loan.customer?.fullName}`}
            extra={<Tag color={STATUS_COLOR[loan.status]}>{loan.status}</Tag>}
            style={{ borderRadius: 12 }}
          >
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label={t('customer')}>{loan.customer?.fullName}</Descriptions.Item>
              <Descriptions.Item label={t('lender')}>{loan.lender?.name}</Descriptions.Item>
              <Descriptions.Item label={t('principal')}>{fmtMoney(loan.principal)}</Descriptions.Item>
              <Descriptions.Item label={t('interestRate')}>{loan.interestRate}%</Descriptions.Item>
              <Descriptions.Item label={t('tenureMonths')}>{loan.tenureMonths} 月</Descriptions.Item>
              <Descriptions.Item label={t('repaymentFrequency')}>{loan.repaymentFrequency}</Descriptions.Item>
              <Descriptions.Item label={t('interestModel')}>{loan.interestModel}</Descriptions.Item>
              <Descriptions.Item label={t('startDate')}>{fmtDate(loan.startDate)}</Descriptions.Item>
              <Descriptions.Item label={t('totalRepayment')}>{fmtMoney(loan.totalRepayment)}</Descriptions.Item>
              <Descriptions.Item label={t('installmentAmount')}>{fmtMoney(loan.installmentAmount)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title="还款记录"
            style={{ borderRadius: 12 }}
            extra={
              <PermissionGuard module="repayments" action="create">
                {loan.status === LoanStatus.ACTIVE && (
                  <Button
                    type="primary" size="small" icon={<PlusOutlined />}
                    onClick={() => setRepayModalOpen(true)}
                  >
                    {t('recordRepayment')}
                  </Button>
                )}
              </PermissionGuard>
            }
          >
            {loan.repayments?.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', padding: 24 }}>暂无还款记录</div>
            ) : (
              <Timeline
                items={loan.repayments?.map((r: any) => ({
                  color: r.overdueDays > 0 ? 'red' : 'green',
                  children: (
                    <div>
                      <div><strong>{fmtDate(r.paidAt)}</strong> — {fmtMoney(r.paidAmount)}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        余额: {fmtMoney(r.remainingBalance)}
                        {r.overdueDays > 0 && <Tag color="red" style={{ marginLeft: 8 }}>逾期 {r.overdueDays} 天</Tag>}
                      </div>
                    </div>
                  ),
                }))}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        open={repayModalOpen}
        title={t('recordRepayment')}
        onCancel={() => setRepayModalOpen(false)}
        onOk={async () => { const v = await form.validateFields(); await handleRepayment(v); }}
        confirmLoading={createRepayment.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="paidAmount" label={tr('paidAmount')} rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0.01} prefix="RM" />
          </Form.Item>
          <Form.Item name="paidAt" label={tr('paidAt')} rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="overdueDays" label={tr('overdueDays')}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="notes" label={tr('notes')}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/\(dashboard\)/loans/
git commit -m "feat: implement loans list and loan detail with repayment recording"
```

---

## Task 27: Users & User Groups Pages

**Files:**
- Create: `apps/frontend/src/app/(dashboard)/users/page.tsx`
- Create: `apps/frontend/src/app/(dashboard)/user-groups/page.tsx`

- [ ] **Step 1: Create apps/frontend/src/app/(dashboard)/users/page.tsx**

```typescript
'use client';

import { useState } from 'react';
import { Button, Form, Input, Select, Switch, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import { PageHeader } from '@/components/common/PageHeader';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { useUserGroups } from '@/hooks/useUserGroups';

export default function UsersPage() {
  const t = useTranslations('users');
  const tc = useTranslations('common');
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading } = useUsers({ page, limit: 20, search });
  const { data: groups } = useUserGroups({ limit: 100 });
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const openCreate = () => { form.resetFields(); setEditId(null); setModalOpen(true); };
  const openEdit = (record: any) => {
    form.setFieldsValue({ name: record.name, email: record.email, userGroupId: record.userGroupId, isActive: record.isActive });
    setEditId(record.id);
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (editId) {
      const { password, ...rest } = values;
      await updateMutation.mutateAsync({ id: editId, data: rest });
    } else {
      await createMutation.mutateAsync(values);
    }
    setModalOpen(false);
  };

  const columns = [
    { title: t('name'), dataIndex: 'name', key: 'name' },
    { title: t('email'), dataIndex: 'email', key: 'email' },
    { title: t('userGroup'), key: 'userGroup', render: (_: unknown, r: any) => r.userGroup?.name || '—' },
    {
      title: t('isActive'), dataIndex: 'isActive', key: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? tc('yes') : tc('no')}</Tag>,
    },
    {
      title: tc('actions'), key: 'actions', width: 120,
      render: (_: unknown, record: any) => (
        <>
          <PermissionGuard module="users" action="update">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </PermissionGuard>
          <PermissionGuard module="users" action="delete">
            <Popconfirm title={t('deleteConfirm')} onConfirm={() => deleteMutation.mutate(record.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </PermissionGuard>
        </>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('title')}
        actions={
          <PermissionGuard module="users" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('addUser')}</Button>
          </PermissionGuard>
        }
      />
      <DataTable
        columns={columns} dataSource={data?.items || []} rowKey="id"
        loading={isLoading} onSearch={setSearch} total={data?.total}
        page={page} pageSize={20} onPageChange={(p) => setPage(p)}
      />
      <FormModal
        open={modalOpen} title={editId ? t('editUser') : t('addUser')}
        form={form} onClose={() => setModalOpen(false)} onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      >
        <Form.Item name="name" label={t('name')} rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="email" label={t('email')} rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
        {!editId && (
          <Form.Item name="password" label={t('password')} rules={[{ required: true, min: 8 }]}>
            <Input.Password />
          </Form.Item>
        )}
        <Form.Item name="userGroupId" label={t('userGroup')}>
          <Select allowClear options={groups?.items?.map((g: any) => ({ label: g.name, value: g.id }))} />
        </Form.Item>
        <Form.Item name="isActive" label={t('isActive')} valuePropName="checked" initialValue={true}>
          <Switch />
        </Form.Item>
      </FormModal>
    </div>
  );
}
```

- [ ] **Step 2: Create apps/frontend/src/app/(dashboard)/user-groups/page.tsx**

```typescript
'use client';

import { useState } from 'react';
import { Button, Form, Input, Switch, Checkbox, Table, Tag, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import { PageHeader } from '@/components/common/PageHeader';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useUserGroups, useUserGroup, useCreateUserGroup, useUpdateUserGroup, useDeleteUserGroup } from '@/hooks/useUserGroups';
import { PermissionModule, PermissionAction } from '@ck-loan/shared';

const MODULES = Object.values(PermissionModule);
const ACTIONS = Object.values(PermissionAction);

function PermissionMatrix({ value, onChange }: { value?: string[]; onChange?: (v: string[]) => void }) {
  const tg = useTranslations('userGroups');
  const current = value || [];

  const toggle = (module: string, action: string) => {
    const key = `${module}:${action}`;
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    onChange?.(next);
  };

  return (
    <Table
      size="small"
      pagination={false}
      dataSource={MODULES.map((m) => ({ module: m, key: m }))}
      columns={[
        { title: '模块', dataIndex: 'module', key: 'module', render: (m: string) => tg(`modules.${m}` as any) },
        ...ACTIONS.map((action) => ({
          title: tg(`actions.${action}` as any),
          key: action,
          render: (_: unknown, row: any) => (
            <Checkbox
              checked={current.includes(`${row.module}:${action}`)}
              onChange={() => toggle(row.module, action)}
            />
          ),
        })),
      ]}
    />
  );
}

export default function UserGroupsPage() {
  const t = useTranslations('userGroups');
  const tc = useTranslations('common');
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading } = useUserGroups({ limit: 100 });
  const createMutation = useCreateUserGroup();
  const updateMutation = useUpdateUserGroup();
  const deleteMutation = useDeleteUserGroup();

  const openCreate = () => { form.resetFields(); setEditId(null); setModalOpen(true); };
  const openEdit = (record: any) => {
    const permKeys = record.permissions?.map((p: any) => `${p.module}:${p.action}`) || [];
    form.setFieldsValue({ name: record.name, isSuperAdmin: record.isSuperAdmin, permKeys });
    setEditId(record.id);
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    const permissions = (values.permKeys || []).map((key: string) => {
      const [module, action] = key.split(':');
      return { module, action };
    });
    const payload = { name: values.name, isSuperAdmin: values.isSuperAdmin || false, permissions };
    if (editId) {
      await updateMutation.mutateAsync({ id: editId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setModalOpen(false);
  };

  const columns = [
    { title: t('name'), dataIndex: 'name', key: 'name' },
    {
      title: t('isSuperAdmin'), dataIndex: 'isSuperAdmin', key: 'isSuperAdmin',
      render: (v: boolean) => v ? <Tag color="gold">Super Admin</Tag> : <Tag>Regular</Tag>,
    },
    {
      title: t('userCount'), key: 'userCount',
      render: (_: unknown, r: any) => <Tag color="blue">{r._count?.users ?? 0}</Tag>,
    },
    {
      title: tc('actions'), key: 'actions', width: 120,
      render: (_: unknown, record: any) => (
        <>
          <PermissionGuard module="user-groups" action="update">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </PermissionGuard>
          <PermissionGuard module="user-groups" action="delete">
            <Popconfirm title="确定删除此用户组？" onConfirm={() => deleteMutation.mutate(record.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </PermissionGuard>
        </>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('title')}
        actions={
          <PermissionGuard module="user-groups" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('addGroup')}</Button>
          </PermissionGuard>
        }
      />
      <DataTable
        columns={columns} dataSource={data?.items || []} rowKey="id" loading={isLoading}
      />
      <FormModal
        open={modalOpen} title={editId ? t('editGroup') : t('addGroup')}
        form={form} onClose={() => setModalOpen(false)} onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        width={700}
      >
        <Form.Item name="name" label={t('name')} rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="isSuperAdmin" label={t('isSuperAdmin')} valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="permKeys" label={t('permissions')}>
          <PermissionMatrix />
        </Form.Item>
      </FormModal>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/\(dashboard\)/users/ apps/frontend/src/app/\(dashboard\)/user-groups/
git commit -m "feat: implement users and user groups pages with permission matrix"
```

---

## Task 28: Install Dependencies & Smoke Test

- [ ] **Step 1: Install all workspace dependencies from root**

```bash
cd /path/to/ck-loan-system && npm install
```

- [ ] **Step 2: Start full stack via Docker**

```bash
docker-compose up --build
```

Wait until you see:
```
loan_backend   | Backend running on http://localhost:3001
loan_frontend  | ▲ Next.js ready on http://localhost:3000
```

- [ ] **Step 3: Run seed (first time only)**

```bash
docker-compose exec backend npx prisma db seed
```

- [ ] **Step 4: Smoke test checklist**

Open `http://localhost:3000` in a browser and verify:

- [ ] Redirects to `/login` when not authenticated
- [ ] Login with `admin@loanapp.com` / `Admin1234!` succeeds and redirects to `/dashboard`
- [ ] Dashboard KPI cards show data (15 total loans, 8 active, etc.)
- [ ] Both chart rows render without error
- [ ] Language switcher toggles between 中文 and EN
- [ ] Sidebar navigation works for all pages
- [ ] Customers page: table loads, create/edit/delete work
- [ ] Lenders page: table loads, create/edit work
- [ ] Loans page: table loads, filter by status works, create loan with both interest models
- [ ] Loan detail `/loans/[id]`: shows details + repayment timeline
- [ ] Record repayment from loan detail page works
- [ ] Repayments page: table loads with overdue rows highlighted red
- [ ] Users page: create/edit/delete work
- [ ] User Groups page: permission matrix renders, create/edit works
- [ ] On mobile (< 768px): sidebar becomes a drawer with hamburger button
- [ ] Login with `viewer@loanapp.com` / `View1234!`: create/edit/delete buttons are hidden

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: complete Phase 3 frontend implementation"
```

---

## Phase 3 Complete ✅

The full-stack Loan Management Admin System is running:
- **Frontend:** `http://localhost:3000` — Next.js 14, Ant Design, bilingual (中文 default), responsive
- **Backend:** `http://localhost:3001` — NestJS REST API, JWT auth, RBAC
- **Database:** PostgreSQL with 15 loans, 10 customers, 3 lenders, seed data

**Seed credentials:**
| Role | Email | Password |
|---|---|---|
| Super Admin | admin@loanapp.com | Admin1234! |
| Loan Officer | officer@loanapp.com | Staff1234! |
| Viewer | viewer@loanapp.com | View1234! |
