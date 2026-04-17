'use client';

import { useState } from 'react';
import { Tag } from 'antd';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { useRepayments } from '@/hooks/useRepayments';

const fmtMoney = (v: string) => `RM ${Number(v).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;
const fmtDate = (v: string) => new Date(v).toLocaleDateString('zh-CN');

export default function RepaymentsPage() {
  const t = useTranslations('repayments');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useRepayments({ page, limit: 20 });

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
      <PageHeader title={t('title')} />
      <DataTable
        columns={columns} dataSource={data?.items || []} rowKey="id"
        loading={isLoading} total={data?.total}
        page={page} pageSize={20} onPageChange={(p) => setPage(p)}
        rowClassName={(record: any) => record.overdueDays > 0 ? 'ant-table-row-danger' : ''}
      />
      <style>{`.ant-table-row-danger td { background: #fff2f0 !important; }`}</style>
    </div>
  );
}
