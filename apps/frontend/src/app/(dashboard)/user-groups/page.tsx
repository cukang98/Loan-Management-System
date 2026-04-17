'use client';

import { useState } from 'react';
import { Button, Form, Input, Switch, Checkbox, Table, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import { PageHeader } from '@/components/common/PageHeader';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useUserGroups, useCreateUserGroup, useUpdateUserGroup, useDeleteUserGroup } from '@/hooks/useUserGroups';
import { PermissionModule, PermissionAction } from '@ck-loan/shared';
import type { UserGroupDto } from '@ck-loan/shared';

interface UserGroupFormValues {
  name: string;
  isSuperAdmin: boolean;
  permKeys: string[];
}

const MODULES = Object.values(PermissionModule);
const ACTIONS = Object.values(PermissionAction);

const MODULE_LABELS: Record<string, string> = {
  loans: '贷款', customers: '客户', lenders: '贷款方',
  repayments: '还款', users: '用户', 'user-groups': '用户组',
};
const ACTION_LABELS: Record<string, string> = {
  create: '创建', read: '查看', update: '编辑', delete: '删除',
};

function PermissionMatrix({ value, onChange }: { value?: string[]; onChange?: (v: string[]) => void }) {
  const current = value || [];

  const toggle = (module: string, action: string) => {
    const key = `${module}:${action}`;
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    onChange?.(next);
  };

  return (
    <Table
      size="small"
      pagination={false}
      dataSource={MODULES.map((m) => ({ module: m, key: m }))}
      columns={[
        {
          title: '模块',
          dataIndex: 'module',
          key: 'module',
          render: (m: string) => MODULE_LABELS[m] ?? m,
        },
        ...ACTIONS.map((action) => ({
          title: ACTION_LABELS[action] ?? action,
          key: action,
          render: (_: unknown, row: { module: string }) => (
            <Checkbox
              checked={current.includes(`${row.module}:${action}`)}
              onChange={() => toggle(row.module, action)}
            />
          ),
        })),
      ]}
    />
  );
}

export default function UserGroupsPage() {
  const t = useTranslations('userGroups');
  const tc = useTranslations('common');
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading } = useUserGroups({ limit: 100 });
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
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </PermissionGuard>
          <PermissionGuard module="user-groups" action="delete">
            <Popconfirm title="确定删除此用户组？" onConfirm={() => deleteMutation.mutate(record.id)}>
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
          <PermissionGuard module="user-groups" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('addGroup')}</Button>
          </PermissionGuard>
        }
      />
      <DataTable
        columns={columns} dataSource={data?.items || []} rowKey="id" loading={isLoading}
      />
      <FormModal
        open={modalOpen} title={editId ? t('editGroup') : t('addGroup')}
        form={form} onClose={() => setModalOpen(false)} onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        width={700}
      >
        <Form.Item name="name" label={t('name')} rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="isSuperAdmin" label={t('isSuperAdmin')} valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="permKeys" label={t('permissions')}>
          <PermissionMatrix />
        </Form.Item>
      </FormModal>
    </div>
  );
}
