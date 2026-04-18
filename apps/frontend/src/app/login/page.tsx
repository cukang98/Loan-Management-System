'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// antd
import { Form, Input, Button, Card, Typography, App } from 'antd';

// ant design icons
import { LockOutlined, BankOutlined } from '@ant-design/icons';

// contexts
import { useAuth } from '@/contexts/AuthContext';

// components
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const t = useTranslations('auth');
  const { login } = useAuth();
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { userId: string; password: string }) => {
    setLoading(true);

    try {
      await login(values.userId, values.password);
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <LanguageSwitcher />
        </div>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <BankOutlined style={{ fontSize: 48, color: '#1677ff' }} />

          <Title level={3} style={{ marginTop: 12, marginBottom: 4 }}>
            {t('loginTitle')}
          </Title>
          <Text type="secondary">{t('loginSubtitle')}</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="userId"
            rules={[{ required: true }]}
          >
            <Input prefix={<BankOutlined />} placeholder={t('userId')} />
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
};

export default LoginPage;
