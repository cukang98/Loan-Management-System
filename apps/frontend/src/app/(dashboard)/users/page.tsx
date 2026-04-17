'use client';

import { useState } from 'react';
import { Button, Form, Input, Select, Switch, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import { PageHeader } from '@/components/common/PageHeader';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { useUserGroups } from '@/hooks/useUserGroups';

export default function UsersPage() {
  const t = useTranslations('users');
  const tc = useTranslations('common');
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading } = useUsers({ page, limit: 20, search });
  const { data: groups } = useUserGroups({ limit: 100 });
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const openCreate = () => { form.resetFields(); setEditId(null); setModalOpen(true); };
  const openEdit = (record: any) => {
    form.setFieldsValue({ name: record.name, email: record.email, userGroupId: record.userGroupId, isActive: record.isActive });
    setEditId(record.id);
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (editId) {
      const { password, ...rest } = values;
      await updateMutation.mutateAsync({ id: editId, data: rest });
    } else {
      await createMutation.mutateAsync(values);
    }
    setModalOpen(false);
  };

  const columns = [
    { title: t('name'), dataIndex: 'name', key: 'name' },
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
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </PermissionGuard>
          <PermissionGuard module="users" action="delete">
            <Popconfirm title={t('deleteConfirm')} onConfirm={() => deleteMutation.mutate(record.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </PermissionGuard>
        </>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('title')}
        actions={
          <PermissionGuard module="users" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('addUser')}</Button>
          </PermissionGuard>
        }
      />
      <DataTable
        columns={columns} dataSource={data?.items || []} rowKey="id"
        loading={isLoading} onSearch={setSearch} total={data?.total}
        page={page} pageSize={20} onPageChange={(p) => setPage(p)}
      />
      <FormModal
        open={modalOpen} title={editId ? t('editUser') : t('addUser')}
        form={form} onClose={() => setModalOpen(false)} onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      >
        <Form.Item name="name" label={t('name')} rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="email" label={t('email')} rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
        {!editId && (
          <Form.Item name="password" label={t('password')} rules={[{ required: true, min: 8 }]}>
            <Input.Password />
          </Form.Item>
        )}
        <Form.Item name="userGroupId" label={t('userGroup')}>
          <Select allowClear options={groups?.items?.map((g: any) => ({ label: g.name, value: g.id }))} />
        </Form.Item>
        <Form.Item name="isActive" label={t('isActive')} valuePropName="checked" initialValue={true}>
          <Switch />
        </Form.Item>
      </FormModal>
    </div>
  );
}
