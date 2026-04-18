import { Button, Card, Flex, Popconfirm, Typography } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { DataTable, PermissionGuard } from '@/components/common';
import { fmtMoney } from '@/lib/utils';
import styles from '../../page.module.css';

interface LenderTableProps {
  data: any[];
  isLoading: boolean;
  pageIndex: number;
  total?: number;
  onSearch: (val: string) => void;
  onPageChange: (p: number) => void;
  onEdit: (record: any) => void;
  onDelete: (id: string) => void;
}

export function LenderTable({ data, isLoading, pageIndex, total, onSearch, onPageChange, onEdit, onDelete }: LenderTableProps) {
  const t = useTranslations('lenders');
  const tc = useTranslations('common');

  const columns = [
    { title: t('name'), dataIndex: 'name', key: 'name' },
    { title: 'User ID', dataIndex: 'userId', key: 'userId' },
    { title: t('availableCapital'), dataIndex: 'availableCapital', key: 'availableCapital', render: fmtMoney },
    { title: t('totalLent'), dataIndex: 'totalLent', key: 'totalLent', render: fmtMoney },
    {
      title: tc('actions'),
      key: 'actions',
      width: 120,
      render: (_: unknown, record: any) => (
        <>
          <PermissionGuard module="lenders" action="update">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </PermissionGuard>
          <PermissionGuard module="lenders" action="delete">
            <Popconfirm title={t('deleteConfirm')} onConfirm={() => onDelete(record.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </PermissionGuard>
        </>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={isLoading}
      onSearch={onSearch}
      total={total}
      page={pageIndex}
      pageSize={10}
      onPageChange={onPageChange}
      mobileCardRender={(record: any) => (
        <Card size="small" className={styles.card}>
          <Flex justify="space-between" align="flex-start">
            <Flex vertical gap={2}>
              <Typography.Text strong>{record.name}</Typography.Text>
              <Typography.Text className={styles.cardMeta}>{t('availableCapital')}: {fmtMoney(record.availableCapital)}</Typography.Text>
              <Typography.Text className={styles.cardMeta}>{t('totalLent')}: {fmtMoney(record.totalLent)}</Typography.Text>
            </Flex>
            <Flex gap={4}>
              <PermissionGuard module="lenders" action="update">
                <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
              </PermissionGuard>
              <PermissionGuard module="lenders" action="delete">
                <Popconfirm title={t('deleteConfirm')} onConfirm={() => onDelete(record.id)}>
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </PermissionGuard>
            </Flex>
          </Flex>
        </Card>
      )}
    />
  );
}
