'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

// antd
import { Button, Form } from 'antd';

// ant design icons
import { PlusOutlined } from '@ant-design/icons';

// components
import { PageHeader, PermissionGuard } from '@/components/common';
import { useUserGroups, useCreateUserGroup, useUpdateUserGroup, useDeleteUserGroup } from '@/hooks/useUserGroups';
import type { UserGroupDto } from '@ck-loan/shared';

// components
import UserGroupTable from './components/UserGroupTable';
import UserGroupFormModal from './components/UserGroupFormModal';

interface UserGroupFormValues {
  name: string;
  isSuperAdmin: boolean;
  permKeys: string[];
}

const UserGroupsPage: React.FC = () => {
  const t = useTranslations('userGroups');
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading } = useUserGroups({ pageSize: 100 });
  const createMutation = useCreateUserGroup();
  const updateMutation = useUpdateUserGroup();
  const deleteMutation = useDeleteUserGroup();

  const openCreate = () => { form.resetFields(); setEditId(null); setModalOpen(true); };
  const openEdit = (record: UserGroupDto) => {
    const permKeys = record.permissions?.map((p) => `${p.module}:${p.action}`) ?? [];
    form.setFieldsValue({ name: record.name, isSuperAdmin: record.isSuperAdmin, permKeys });
    setEditId(record.id);
    setModalOpen(true);
  };

  const handleSubmit = async (raw: unknown) => {
    const { name, isSuperAdmin, permKeys } = raw as UserGroupFormValues;
    const permissions = (permKeys || []).map((key: string) => {
      const [module, action] = key.split(':');
      return { module, action };
    });
    const payload = { name, isSuperAdmin: isSuperAdmin || false, permissions };

    if (editId) {
      await updateMutation.mutateAsync({ id: editId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setModalOpen(false);
  };

  return (
    <>
      <PageHeader
        title={t('title')}
        actions={
          <PermissionGuard module="user-groups" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('addGroup')}</Button>
          </PermissionGuard>
        }
      />

      <UserGroupTable
        data={data?.items || []}
        isLoading={isLoading}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      <UserGroupFormModal
        open={modalOpen}
        editId={editId}
        form={form}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default UserGroupsPage;
