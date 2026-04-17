'use client';

import { useState } from 'react';
import { Drawer } from 'antd';
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

export function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const [adminOpen, setAdminOpen] = useState(false);

  const isAdminActive = pathname.startsWith('/users') || pathname.startsWith('/user-groups');

  const navItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: t('dashboard') },
    { key: '/customers', icon: <TeamOutlined />, label: t('customers') },
    { key: '/lenders', icon: <BankOutlined />, label: t('lenders') },
    { key: '/loans', icon: <FileTextOutlined />, label: t('loans') },
    { key: '/repayments', icon: <DollarOutlined />, label: t('repayments') },
  ];

  const adminSubItems = [
    { key: '/users', icon: <UserOutlined />, label: t('users') },
    { key: '/user-groups', icon: <SettingOutlined />, label: t('userGroups') },
  ];

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'stretch',
          zIndex: 200,
        }}
      >
        {navItems.map(({ key, icon, label }) => {
          const active = pathname.startsWith(key);
          return (
            <button
              key={key}
              onClick={() => router.push(key)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: active ? '#1677ff' : '#8c8c8c',
                fontSize: 10,
                padding: '6px 0',
              }}
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setAdminOpen(true)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: isAdminActive ? '#1677ff' : '#8c8c8c',
            fontSize: 10,
            padding: '6px 0',
          }}
        >
          <span style={{ fontSize: 20 }}>
            <SettingOutlined />
          </span>
          <span>{t('admin')}</span>
        </button>
      </nav>

      <Drawer
        placement="bottom"
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        height={140}
        title={t('admin')}
        styles={{ body: { padding: 0 } }}
      >
        {adminSubItems.map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => {
              router.push(key);
              setAdminOpen(false);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 20px',
              border: 'none',
              borderBottom: '1px solid #f0f0f0',
              background: pathname.startsWith(key) ? '#e6f4ff' : 'none',
              cursor: 'pointer',
              fontSize: 15,
              color: pathname.startsWith(key) ? '#1677ff' : '#262626',
            }}
          >
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </Drawer>
    </>
  );
}
