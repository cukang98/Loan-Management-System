'use client';

import { useState } from 'react';
import { Layout, Grid } from 'antd';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/contexts/AuthContext';

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
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
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

      <Layout>
        <Header />
        <Content
          style={{
            margin: isMobile ? 12 : 24,
            padding: isMobile ? 16 : 24,
            paddingBottom: isMobile ? 72 : 24,
            background: '#fff',
            borderRadius: 12,
            minHeight: 360,
          }}
        >
          {children}
        </Content>
        {isMobile && <BottomNav />}
      </Layout>
    </Layout>
  );
}
