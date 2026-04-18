'use client';

import type { ReactNode } from 'react';

// antd
import { Flex, Typography, Space } from 'antd';

// styles
import styles from './PageHeader.module.css';


const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, actions }) => {
  return (
    <Flex justify="space-between" align="center" className={styles.root}>
      <Title level={4} style={{ margin: 0 }}>
        {title}
      </Title>
      {actions && <Space>{actions}</Space>}
    </Flex>
  );
}

export default PageHeader;
