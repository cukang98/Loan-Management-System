"use client";

import type { ReactNode } from "react";

// antd
import { Card, Statistic, Typography, Flex } from "antd";

// styles
import styles from "./KPICard.module.css";

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

const KPICard = ({
  title,
  value,
  prefix,
  suffix,
  color = "#1677ff",
  icon,
  loading = false,
}: KPICardProps) => {
  return (
    <Card
      loading={loading}
      style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      styles={{ body: { padding: "20px 24px" } }}
    >
      <Flex justify="space-between" align="flex-start">
        <Flex vertical gap={4} style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {title}
          </Text>
          <Statistic
            value={value}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{
              color,
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          />
        </Flex>
        {icon && (
          <Flex
            align="center"
            justify="center"
            className={styles.icon}
            style={{ background: `${color}18`, color }}
          >
            {icon}
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export default KPICard;
