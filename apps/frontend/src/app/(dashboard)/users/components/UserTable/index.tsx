// antd
import { Button, Card, Flex, Popconfirm, Tag, Typography } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

// next-intl
import { useTranslations } from 'next-intl';

// components
import { DataTable, PermissionGuard } from '@/components/common';

// styles
import styles from '../../page.module.css';

interface UserTableProps {
  data: any[];
  isLoading: boolean;
  pageIndex: number;
  total?: number;
  onSearch: (val: string) => void;
  onPageChange: (p: number) => void;
  onEdit: (record: any) => void;
  onDelete: (id: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ data, isLoading, pageIndex, total, onSearch, onPageChange, onEdit, onDelete }) => {
  const t = useTranslations('users');
  const tc = useTranslations('common');

  const columns = [
    { title: t('name'), dataIndex: 'name', key: 'name' },
    { title: t('userId'), dataIndex: 'userId', key: 'userId' },
    { title: t('email'), dataIndex: 'email', key: 'email' },
    { title: t('userGroup'), key: 'userGroup', render: (_: unknown, r: any) => r.userGroup?.name || '—' },
    {
      title: t('isActive'), dataIndex: 'isActive', key: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? tc('yes') : tc('no')}</Tag>,
    },
    {
      title: tc('actions'), key: 'actions', width: 120,
      render: (_: unknown, record: any) => (
        <>
          <PermissionGuard module="users" action="update">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </PermissionGuard>

          <PermissionGuard module="users" action="delete">
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
              <Flex gap={8} align="center">
                <Typography.Text strong>{record.name}</Typography.Text>

                <Tag color={record.isActive ? 'green' : 'default'}>
                  {record.isActive ? tc('yes') : tc('no')}
                </Tag>
              </Flex>

              <Typography.Text className={styles.cardMeta}>{record.userId}</Typography.Text>

              <Typography.Text className={styles.cardMeta}>{record.email}</Typography.Text>

              {record.userGroup && (
                <Tag style={{ width: 'fit-content', marginTop: 4 }}>{record.userGroup.name}</Tag>
              )}
            </Flex>

            <Flex gap={4}>
              <PermissionGuard module="users" action="update">
                <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
              </PermissionGuard>

              <PermissionGuard module="users" action="delete">
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

export default UserTable;