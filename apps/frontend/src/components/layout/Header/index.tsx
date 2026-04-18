'use client';

import { useRouter } from 'next/navigation';

import { useTranslations } from 'next-intl';

import { Layout, Space, Avatar, Dropdown, Typography, Flex, Grid } from 'antd';

import { UserOutlined, LogoutOutlined, BankOutlined } from '@ant-design/icons';

import { LanguageSwitcher } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';

import styles from './Header.module.css';


const { useBreakpoint } = Grid;
const { Header: AntHeader } = Layout;
const { Text } = Typography;

export function Header() {
  const t = useTranslations('nav');
  const { user, logout } = useAuth();
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

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
      className={styles.header}
      style={{ padding: isMobile ? '0 16px' : '0 24px' }}
    >
      <Flex align="center" justify="space-between" style={{ height: '100%' }}>
        <Space>
          <BankOutlined style={{ fontSize: 22, color: '#1677ff' }} />
          <Text strong style={{ fontSize: 16 }}>LoanAdmin</Text>
        </Space>

        <Space size={12}>
          <LanguageSwitcher />
          <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar size={32} icon={<UserOutlined />} style={{ background: '#1677ff' }} />
              {!isMobile && <Text>{user?.name}</Text>}
            </Space>
          </Dropdown>
        </Space>
      </Flex>
    </AntHeader>
  );
}
