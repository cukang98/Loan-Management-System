'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { PageHeader, PermissionGuard } from '@/components/common';
import { useLenders, useCreateLender, useUpdateLender, useDeleteLender } from '@/hooks/useLenders';

import { LenderTable } from './components/LenderTable';
import { LenderFormModal } from './components/LenderFormModal';

const LendersPage: React.FC = () => {
  const t = useTranslations('lenders');
  const [form] = Form.useForm();
  const [pageIndex, setPageIndex] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading } = useLenders({ pageIndex, search });
  const createMutation = useCreateLender();
  const updateMutation = useUpdateLender();
  const deleteMutation = useDeleteLender();

  const openCreate = () => { form.resetFields(); setEditId(null); setModalOpen(true); };
  const openEdit = (record: any) => {
    form.setFieldsValue({ name: record.name, availableCapital: Number(record.availableCapital), isActive: record.isActive });
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

  return (
    <>
      <PageHeader
        title={t('title')}
        actions={
          <PermissionGuard module="lenders" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('addLender')}</Button>
          </PermissionGuard>
        }
      />
      <LenderTable
        data={data?.items || []}
        isLoading={isLoading}
        pageIndex={pageIndex}
        total={data?.pagination?.totalItem}
        onSearch={setSearch}
        onPageChange={setPageIndex}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
      <LenderFormModal
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

export default LendersPage;
