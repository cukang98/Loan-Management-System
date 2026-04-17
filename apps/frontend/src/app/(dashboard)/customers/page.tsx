'use client';

import { useState } from 'react';
import { Button, Form, Input, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import { PageHeader } from '@/components/common/PageHeader';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useCustomers';

export default function CustomersPage() {
  const t = useTranslations('customers');
  const tc = useTranslations('common');
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading } = useCustomers({ page, limit: 20, search });
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const openCreate = () => { form.resetFields(); setEditId(null); setModalOpen(true); };
  const openEdit = (record: any) => {
    form.setFieldsValue(record);
    setEditId(record.id);
    setModalOpen(true);
  };

  const handleSubmit = async (values: unknown) => {
    if (editId) {
      await updateMutation.mutateAsync({ id: editId, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setModalOpen(false);
    form.resetFields();
  };

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
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </PermissionGuard>
          <PermissionGuard module="customers" action="delete">
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
          <PermissionGuard module="customers" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t('addCustomer')}
            </Button>
          </PermissionGuard>
        }
      />
      <DataTable
        columns={columns} dataSource={data?.items || []} rowKey="id"
        loading={isLoading} onSearch={setSearch} total={data?.total}
        page={page} pageSize={20} onPageChange={(p) => setPage(p)}
      />
      <FormModal
        open={modalOpen} title={editId ? t('editCustomer') : t('addCustomer')}
        form={form} onClose={() => setModalOpen(false)} onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      >
        <Form.Item name="fullName" label={t('fullName')} rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="phone" label={t('phone')} rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="email" label={t('email')} rules={[{ type: 'email' }]}><Input /></Form.Item>
        <Form.Item name="address" label={t('address')}><Input /></Form.Item>
        <Form.Item name="notes" label={t('notes')}><Input.TextArea rows={3} /></Form.Item>
      </FormModal>
    </div>
  );
}
