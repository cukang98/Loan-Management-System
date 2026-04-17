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
