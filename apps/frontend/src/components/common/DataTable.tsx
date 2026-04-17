'use client';

import { Table, Input, Space, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import type { TableProps } from 'antd';
import { useState } from 'react';

interface DataTableProps<T> extends TableProps<T> {
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  toolbarRight?: React.ReactNode;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
}

export function DataTable<T extends object>({
  onSearch,
  searchPlaceholder,
  toolbarRight,
  total,
  page = 1,
  pageSize = 20,
  onPageChange,
  ...tableProps
}: DataTableProps<T>) {
  const t = useTranslations('common');
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <div>
      {(onSearch || toolbarRight) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            gap: 12,
          }}
        >
          <Space>
            {onSearch && (
              <Input.Search
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={handleSearch}
                placeholder={searchPlaceholder || t('search')}
                allowClear
                style={{ width: 280 }}
                prefix={<SearchOutlined />}
              />
            )}
          </Space>
          <Space>{toolbarRight}</Space>
        </div>
      )}

      <Table
        {...tableProps}
        locale={{
          emptyText: (
            <Empty description={t('noData')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ),
        }}
        pagination={
          total !== undefined
            ? {
                current: page,
                pageSize,
                total,
                onChange: onPageChange,
                showSizeChanger: true,
                showTotal: (tot) => t('total', { count: tot }),
              }
            : tableProps.pagination
        }
        style={{ borderRadius: 8, overflow: 'hidden' }}
      />
    </div>
  );
}
