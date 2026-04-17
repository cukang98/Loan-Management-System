'use client';

import { useState } from 'react';
import { Button, Form, Select, InputNumber, DatePicker, Input, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import { PageHeader } from '@/components/common/PageHeader';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useRepayments, useCreateRepayment } from '@/hooks/useRepayments';
import { useLoans } from '@/hooks/useLoans';
import { LoanStatus } from '@ck-loan/shared';

const fmtMoney = (v: string) => `RM ${Number(v).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;
const fmtDate = (v: string) => new Date(v).toLocaleDateString('zh-CN');

export default function RepaymentsPage() {
  const t = useTranslations('repayments');
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useRepayments({ page, limit: 20 });
  const { data: loansData } = useLoans({ limit: 200, status: LoanStatus.ACTIVE });
  const createMutation = useCreateRepayment();

  const handleSubmit = async (values: any) => {
    await createMutation.mutateAsync({
      ...values,
      paidAt: values.paidAt.format('YYYY-MM-DD'),
    });
    setModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: '客户 / Customer',
      key: 'customer',
      render: (_: unknown, record: any) => record.loan?.customer?.fullName || '—',
    },
    { title: t('paidAmount'), dataIndex: 'paidAmount', key: 'paidAmount', render: fmtMoney },
    { title: t('paidAt'), dataIndex: 'paidAt', key: 'paidAt', render: fmtDate },
    { title: t('remainingBalance'), dataIndex: 'remainingBalance', key: 'remainingBalance', render: fmtMoney },
    {
      title: t('overdueDays'),
      dataIndex: 'overdueDays',
      key: 'overdueDays',
      render: (v: number) => v > 0 ? <Tag color="red">{v} 天</Tag> : <Tag color="green">准时</Tag>,
    },
    { title: t('notes'), dataIndex: 'notes', key: 'notes', render: (v: string) => v || '—' },
  ];

  return (
    <div>
      <PageHeader
        title={t('title')}
        actions={
          <PermissionGuard module="repayments" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { form.resetFields(); setModalOpen(true); }}
            >
              {t('addRepayment')}
            </Button>
          </PermissionGuard>
        }
      />

      <DataTable
        columns={columns} dataSource={data?.items || []} rowKey="id"
        loading={isLoading} total={data?.total}
        page={page} pageSize={20} onPageChange={(p) => setPage(p)}
        rowClassName={(record: any) => record.overdueDays > 0 ? 'ant-table-row-danger' : ''}
      />
      <style>{`.ant-table-row-danger td { background: #fff2f0 !important; }`}</style>

      <FormModal
        open={modalOpen} title={t('addRepayment')} form={form}
        onClose={() => setModalOpen(false)} onSubmit={handleSubmit}
        loading={createMutation.isPending}
      >
        <Form.Item name="loanId" label="贷款 / Loan" rules={[{ required: true }]}>
          <Select
            showSearch
            optionFilterProp="label"
            options={loansData?.items?.map((l: any) => ({
              label: `${l.customer?.fullName} — RM ${Number(l.principal).toLocaleString()}`,
              value: l.id,
            }))}
          />
        </Form.Item>
        <Form.Item name="paidAmount" label={t('paidAmount')} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0.01} step={0.01} prefix="RM" />
        </Form.Item>
        <Form.Item name="paidAt" label={t('paidAt')} rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="overdueDays" label={t('overdueDays')}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item name="notes" label={t('notes')}>
          <Input.TextArea rows={2} />
        </Form.Item>
      </FormModal>
    </div>
  );
}
