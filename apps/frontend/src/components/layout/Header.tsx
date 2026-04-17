'use client';

import { Layout, Space, Avatar, Dropdown, Typography, Grid } from 'antd';
import { UserOutlined, LogoutOutlined, BankOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

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
      style={{
        background: '#fff',
        padding: isMobile ? '0 16px' : '0 24px',
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

      <Space size={12}>
        <LanguageSwitcher />
        <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              size={32}
              icon={<UserOutlined />}
              style={{ background: '#1677ff' }}
            />
            {!isMobile && <Text>{user?.name}</Text>}
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
