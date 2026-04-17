'use client';

import { useState } from 'react';
import { Button, Form, Select, InputNumber, DatePicker, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import { PageHeader } from '@/components/common/PageHeader';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useLoans, useCreateLoan } from '@/hooks/useLoans';
import { useCustomers } from '@/hooks/useCustomers';
import { useLenders } from '@/hooks/useLenders';
import { RepaymentFrequency, InterestModel, LoanStatus } from '@ck-loan/shared';

const fmtMoney = (v: string) => `RM ${Number(v).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'blue', COMPLETED: 'green', DEFAULTED: 'red',
};

export default function LoansPage() {
  const t = useTranslations('loans');
  const tc = useTranslations('common');
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useLoans({ page, limit: 20, status: statusFilter });
  const { data: customers } = useCustomers({ limit: 200 });
  const { data: lenders } = useLenders({ limit: 200 });
  const createMutation = useCreateLoan();

  const handleSubmit = async (values: any) => {
    await createMutation.mutateAsync({
      ...values,
      startDate: values.startDate.format('YYYY-MM-DD'),
    });
    setModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: t('customer'), key: 'customer',
      render: (_: unknown, r: any) => <Link href={`/loans/${r.id}`}>{r.customer?.fullName}</Link>,
    },
    { title: t('lender'), key: 'lender', render: (_: unknown, r: any) => r.lender?.name },
    { title: t('principal'), dataIndex: 'principal', key: 'principal', render: fmtMoney },
    { title: t('interestRate'), dataIndex: 'interestRate', key: 'interestRate', render: (v: string) => `${v}%` },
    { title: t('tenureMonths'), dataIndex: 'tenureMonths', key: 'tenureMonths', render: (v: number) => `${v}M` },
    { title: t('installmentAmount'), dataIndex: 'installmentAmount', key: 'installmentAmount', render: fmtMoney },
    {
      title: t('status'), dataIndex: 'status', key: 'status',
      render: (v: LoanStatus) => <Tag color={STATUS_COLOR[v]}>{v}</Tag>,
    },
    {
      title: tc('actions'), key: 'actions', width: 80,
      render: (_: unknown, r: any) => <Link href={`/loans/${r.id}`}><Button type="link" size="small">详情</Button></Link>,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('title')}
        actions={
          <>
            <Select
              allowClear
              placeholder={t('status')}
              style={{ width: 140 }}
              onChange={(v) => setStatusFilter(v)}
              options={[
                { label: t('statusActive'), value: 'ACTIVE' },
                { label: t('statusCompleted'), value: 'COMPLETED' },
                { label: t('statusDefaulted'), value: 'DEFAULTED' },
              ]}
            />
            <PermissionGuard module="loans" action="create">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                {t('addLoan')}
              </Button>
            </PermissionGuard>
          </>
        }
      />

      <DataTable
        columns={columns} dataSource={data?.items || []} rowKey="id"
        loading={isLoading} total={data?.total}
        page={page} pageSize={20} onPageChange={(p) => setPage(p)}
      />

      <FormModal
        open={modalOpen} title={t('addLoan')} form={form}
        onClose={() => setModalOpen(false)} onSubmit={handleSubmit}
        loading={createMutation.isPending} width={640}
      >
        <Form.Item name="customerId" label={t('customer')} rules={[{ required: true }]}>
          <Select showSearch optionFilterProp="label"
            options={customers?.items?.map((c: any) => ({ label: c.fullName, value: c.id }))} />
        </Form.Item>
        <Form.Item name="lenderId" label={t('lender')} rules={[{ required: true }]}>
          <Select showSearch optionFilterProp="label"
            options={lenders?.items?.map((l: any) => ({ label: `${l.name} (RM ${Number(l.availableCapital).toLocaleString()})`, value: l.id }))} />
        </Form.Item>
        <Form.Item name="principal" label={t('principal')} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={1} prefix="RM" />
        </Form.Item>
        <Form.Item name="interestRate" label={t('interestRate')} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0.1} max={100} step={0.1} suffix="%" />
        </Form.Item>
        <Form.Item name="tenureMonths" label={t('tenureMonths')} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={1} max={360} />
        </Form.Item>
        <Form.Item name="repaymentFrequency" label={t('repaymentFrequency')} rules={[{ required: true }]}>
          <Select options={[
            { label: t('freqWeekly'), value: RepaymentFrequency.WEEKLY },
            { label: t('freqBiweekly'), value: RepaymentFrequency.BIWEEKLY },
            { label: t('freqMonthly'), value: RepaymentFrequency.MONTHLY },
          ]} />
        </Form.Item>
        <Form.Item name="interestModel" label={t('interestModel')} rules={[{ required: true }]}>
          <Select options={[
            { label: t('modelFlat'), value: InterestModel.FLAT },
            { label: t('modelReducing'), value: InterestModel.REDUCING },
          ]} />
        </Form.Item>
        <Form.Item name="startDate" label={t('startDate')} rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </FormModal>
    </div>
  );
}
