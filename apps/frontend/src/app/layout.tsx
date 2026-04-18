import type { Metadata } from 'next';

import './globals.css';
import { AppProviders } from '@/providers/AppProviders';

export const metadata: Metadata = {
  title: '贷款管理系统 | Loan Management System',
  description: 'Professional loan management admin dashboard',
};

const RootLayout: React.FC<{
  children: React.ReactNode;
}> = ({
  children,
}) => {
  return (
    <html lang="zh">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
};

export default RootLayout;
