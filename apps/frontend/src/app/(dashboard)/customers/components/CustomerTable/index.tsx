import { useTranslations } from 'next-intl';

// antd
import { Button, Card, Flex, Popconfirm, Tag, Typography } from 'antd';

// antd icons
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

// components
import { DataTable, PermissionGuard } from '@/components/common';

// styles
import styles from '../../page.module.css';

interface CustomerTableProps {
  data: any[];
  isLoading: boolean;
  pageIndex: number;
  total?: number;
  onSearch: (val: string) => void;
  onPageChange: (p: number) => void;
  onEdit: (record: any) => void;
  onDelete: (id: string) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ data, isLoading, pageIndex, total, onSearch, onPageChange, onEdit, onDelete }) => {
  const t = useTranslations('customers');
  const tc = useTranslations('common');

  const columns = [
    { title: t('fullName'), dataIndex: 'fullName', key: 'fullName' },
    { title: t('phone'), dataIndex: 'phone', key: 'phone' },
    { title: t('email'), dataIndex: 'email', key: 'email', render: (v: string) => v || '—' },
    { title: t('address'), dataIndex: 'address', key: 'address', ellipsis: true, render: (v: string) => v || '—' },
    {
      title: t('loanCount'),
      dataIndex: ['_count', 'loans'],
      key: 'loanCount',
      render: (v: number) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: tc('actions'),
      key: 'actions',
      width: 120,
      render: (_: unknown, record: any) => (
        <>
          <PermissionGuard module="customers" action="update">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </PermissionGuard>

          <PermissionGuard module="customers" action="delete">
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
              <Typography.Text strong>{record.fullName}</Typography.Text>

              <Typography.Text className={styles.cardMeta}>{record.phone}</Typography.Text>
              {record.email && <Typography.Text className={styles.cardMeta}>{record.email}</Typography.Text>}

              {record.address && <Typography.Text className={styles.cardMeta}>{record.address}</Typography.Text>}

              <Tag color="blue" style={{ width: 'fit-content', marginTop: 4 }}>
                {t('loanCount')}: {record._count?.loans ?? 0}
              </Tag>
            </Flex>

            <Flex gap={4}>
              <PermissionGuard module="customers" action="update">
                <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
              </PermissionGuard>

              <PermissionGuard module="customers" action="delete">
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

export default CustomerTable;
