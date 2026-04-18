import { Card, Flex, Tag, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/common';
import { fmtMoney, fmtDate } from '@/lib/utils';
import styles from '../../page.module.css';

interface RepaymentTableProps {
  data: any[];
  isLoading: boolean;
  pageIndex: number;
  total?: number;
  onPageChange: (p: number) => void;
}

export function RepaymentTable({ data, isLoading, pageIndex, total, onPageChange }: RepaymentTableProps) {
  const t = useTranslations('repayments');

  const columns = [
    {
      title: '客户 / Customer',
      key: 'customer',
      render: (_: unknown, record: any) => record.loan?.customer?.fullName || '—',
    },
    { title: t('amount'), dataIndex: 'amount', key: 'amount', render: fmtMoney },
    { title: t('paymentDate'), dataIndex: 'paymentDate', key: 'paymentDate', render: fmtDate },
    {
      title: t('method'), dataIndex: 'method', key: 'method',
      render: (v: string) => v ? <Tag>{v}</Tag> : '—',
    },
    { title: t('notes'), dataIndex: 'notes', key: 'notes', render: (v: string) => v || '—' },
  ];

  return (
    <DataTable
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={isLoading}
      total={total}
      page={pageIndex}
      pageSize={10}
      onPageChange={onPageChange}
      mobileCardRender={(record: any) => (
        <Card size="small" className={styles.card}>
          <Flex justify="space-between" align="flex-start">
            <Flex vertical gap={2}>
              <Typography.Text strong>{record.loan?.customer?.fullName || '—'}</Typography.Text>
              <Typography.Text className={styles.cardMeta}>{fmtDate(record.paymentDate)}</Typography.Text>
              <Typography.Text className={styles.cardMeta}>
                {t('amount')}: {fmtMoney(record.amount)}
              </Typography.Text>
            </Flex>
            {record.method ? <Tag>{record.method}</Tag> : null}
          </Flex>
        </Card>
      )}
    />
  );
}
