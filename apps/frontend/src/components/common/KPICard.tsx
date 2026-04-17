'use client';

import { Card, Statistic, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Text } = Typography;

interface KPICardProps {
  title: string;
  value: string | number;
  prefix?: ReactNode;
  suffix?: string;
  color?: string;
  icon?: ReactNode;
  loading?: boolean;
}

export function KPICard({
  title,
  value,
  prefix,
  suffix,
  color = '#1677ff',
  icon,
  loading = false,
}: KPICardProps) {
  return (
    <Card
      loading={loading}
      style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {title}
          </Text>
          <Statistic
            value={value}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{ color, fontSize: 28, fontWeight: 700, lineHeight: 1.3 }}
            style={{ marginTop: 4 }}
          />
        </div>
        {icon && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `${color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              color,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
