'use client';

import { usePathname, useRouter } from 'next/navigation';

import { useTranslations } from 'next-intl';

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
      label: t('admin'),
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
