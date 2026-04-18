'use client';

import { useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useTranslations } from 'next-intl';

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

import styles from './BottomNav.module.css';


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
      <nav className={styles.nav}>
        {navItems.map(({ key, icon, label }) => {
          const active = pathname.startsWith(key);
          return (
            <button
              key={key}
              onClick={() => router.push(key)}
              className={`${styles.navBtn} ${active ? styles.active : ''}`}
            >
              <span className={styles.navBtnIcon}>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setAdminOpen(true)}
          className={`${styles.navBtn} ${isAdminActive ? styles.active : ''}`}
        >
          <span className={styles.navBtnIcon}><SettingOutlined /></span>
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
            onClick={() => { router.push(key); setAdminOpen(false); }}
            className={`${styles.drawerBtn} ${pathname.startsWith(key) ? styles.active : ''}`}
          >
            <span className={styles.drawerBtnIcon}>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </Drawer>
    </>
  );
}
