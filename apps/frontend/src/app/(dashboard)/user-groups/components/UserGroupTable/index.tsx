// antd
import { Button, Card, Flex, Popconfirm, Tag, Typography } from 'antd';

// ant design icons
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

// next-intl
import { useTranslations } from 'next-intl';

// components
import { DataTable, PermissionGuard } from '@/components/common';

// styles
import styles from '../../page.module.css';

interface UserGroupTableProps {
  data: any[];
  isLoading: boolean;
  onEdit: (record: any) => void;
  onDelete: (id: string) => void;
}

const UserGroupTable: React.FC<UserGroupTableProps> = ({ data, isLoading, onEdit, onDelete }) => {
  const t = useTranslations('userGroups');
  const tc = useTranslations('common');

  const columns = [
    { title: t('name'), dataIndex: 'name', key: 'name' },
    {
      title: t('isSuperAdmin'), dataIndex: 'isSuperAdmin', key: 'isSuperAdmin',
      render: (v: boolean) => v ? <Tag color="gold">Super Admin</Tag> : <Tag>Regular</Tag>,
    },
    {
      title: t('userCount'), key: 'userCount',
      render: (_: unknown, r: any) => <Tag color="blue">{r._count?.users ?? 0}</Tag>,
    },
    {
      title: tc('actions'), key: 'actions', width: 120,
      render: (_: unknown, record: any) => (
        <>
          <PermissionGuard module="user-groups" action="update">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </PermissionGuard>

          <PermissionGuard module="user-groups" action="delete">
            <Popconfirm title="确定删除此用户组？" onConfirm={() => onDelete(record.id)}>
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
      mobileCardRender={(record: any) => (
        <Card size="small" className={styles.card}>
          <Flex justify="space-between" align="flex-start">
            <Flex vertical gap={4}>
              <Flex gap={8} align="center">
                <Typography.Text strong>{record.name}</Typography.Text>

                {record.isSuperAdmin ? <Tag color="gold">Super Admin</Tag> : <Tag>Regular</Tag>}
              </Flex>

              <Tag color="blue" style={{ width: 'fit-content' }}>
                {t('userCount')}: {record._count?.users ?? 0}
              </Tag>
            </Flex>

            <Flex gap={4}>
              <PermissionGuard module="user-groups" action="update">
                <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
              </PermissionGuard>

              <PermissionGuard module="user-groups" action="delete">
                <Popconfirm title="确定删除此用户组？" onConfirm={() => onDelete(record.id)}>
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

export default UserGroupTable;
