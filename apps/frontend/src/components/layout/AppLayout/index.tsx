'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Layout, Grid, Flex, Spin, Typography } from 'antd';

import { useAuth } from '@/contexts/AuthContext';

import { BottomNav } from '../BottomNav';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';

import styles from './AppLayout.module.css';


const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  if (!isLoading && !user) {
    router.push('/login');
  }

  if (isLoading || !user) {
    return (
      <Flex align="center" justify="center" className={styles.loading}>
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={220}
          className={styles.sider}
        >
          <Flex align="center" justify="center" className={styles.siderLogo}>
            {!collapsed && <Typography.Text strong style={{ color: '#1677ff', fontSize: 15 }}>LoanAdmin</Typography.Text>}
          </Flex>
          <Sidebar />
        </Sider>
      )}

      <Layout>
        <Header />
        <Content
          style={{
            margin: isMobile ? 12 : 24,
            padding: isMobile ? 16 : 24,
            paddingBottom: isMobile ? 72 : 24,
          }}
          className={styles.content}
        >
          {children}
        </Content>
        {isMobile && <BottomNav />}
      </Layout>
    </Layout>
  );
}
