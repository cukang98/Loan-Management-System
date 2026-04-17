'use client';

import { useState } from 'react';
import { Button, Form, Input, InputNumber, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import { PageHeader } from '@/components/common/PageHeader';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useLenders, useCreateLender, useUpdateLender, useDeleteLender } from '@/hooks/useLenders';

const fmtMoney = (v: string) => `RM ${Number(v).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;

export default function LendersPage() {
  const t = useTranslations('lenders');
  const tc = useTranslations('common');
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading } = useLenders({ page, limit: 20, search });
  const createMutation = useCreateLender();
  const updateMutation = useUpdateLender();
  const deleteMutation = useDeleteLender();

  const openCreate = () => { form.resetFields(); setEditId(null); setModalOpen(true); };
  const openEdit = (record: any) => {
    form.setFieldsValue({ name: record.name, availableCapital: Number(record.availableCapital) });
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
  };

  const columns = [
    { title: t('name'), dataIndex: 'name', key: 'name' },
    { title: t('availableCapital'), dataIndex: 'availableCapital', key: 'availableCapital', render: fmtMoney },
    { title: t('totalLent'), dataIndex: 'totalLent', key: 'totalLent', render: fmtMoney },
    {
      title: tc('actions'), key: 'actions', width: 120,
      render: (_: unknown, record: any) => (
        <>
          <PermissionGuard module="lenders" action="update">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </PermissionGuard>
          <PermissionGuard module="lenders" action="delete">
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
          <PermissionGuard module="lenders" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('addLender')}</Button>
          </PermissionGuard>
        }
      />
      <DataTable
        columns={columns} dataSource={data?.items || []} rowKey="id"
        loading={isLoading} onSearch={setSearch} total={data?.total}
        page={page} pageSize={20} onPageChange={(p) => setPage(p)}
      />
      <FormModal
        open={modalOpen} title={editId ? t('editLender') : t('addLender')}
        form={form} onClose={() => setModalOpen(false)} onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      >
        <Form.Item name="name" label={t('name')} rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="availableCapital" label={t('availableCapital')} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} prefix="RM" />
        </Form.Item>
      </FormModal>
    </div>
  );
}
