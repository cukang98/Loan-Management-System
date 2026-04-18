import Link from 'next/link';
import { Button, Card, Flex, Tag, Typography } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/common';
import { fmtMoney } from '@/lib/utils';
import type { LoanDto, LoanStatus } from '@ck-loan/shared';
import styles from '../../page.module.css';

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'blue', COMPLETED: 'green', DEFAULTED: 'red',
};

const TENURE_TYPE_LABEL: Record<string, string> = {
  DAY: 'D', WEEK: 'W', MONTH: 'M',
};

interface LoanTableProps {
  data: LoanDto[];
  isLoading: boolean;
  pageIndex: number;
  total?: number;
  onPageChange: (p: number) => void;
}

export function LoanTable({ data, isLoading, pageIndex, total, onPageChange }: LoanTableProps) {
  const t = useTranslations('loans');
  const tc = useTranslations('common');

  const columns = [
    {
      title: t('customer'), key: 'customer',
      render: (_: unknown, r: any) => <Link href={`/loans/${r.id}`}>{r.customer?.fullName}</Link>,
    },
    { title: t('lender'), key: 'lender', render: (_: unknown, r: any) => r.lender?.name },
    { title: t('principal'), dataIndex: 'principal', key: 'principal', render: fmtMoney },
    {
      title: t('tenure'), key: 'tenure',
      render: (_: unknown, r: any) => `${r.tenure} ${TENURE_TYPE_LABEL[r.tenureType] ?? r.tenureType}`,
    },
    {
      title: t('repaymentType'), dataIndex: 'repaymentType', key: 'repaymentType',
      render: (v: string) => <Tag>{v}</Tag>,
    },
    { title: t('interestTotal'), dataIndex: 'interestAmount', key: 'interestAmount', render: fmtMoney },
    {
      title: t('status'), dataIndex: 'status', key: 'status',
      render: (v: LoanStatus) => <Tag color={STATUS_COLOR[v]}>{v}</Tag>,
    },
    {
      title: tc('actions'), key: 'actions', width: 80,
      render: (_: unknown, r: any) => (
        <Link href={`/loans/${r.id}`}>
          <Button type="link" size="small">{tc('detail')}</Button>
        </Link>
      ),
    },
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
        <Link href={`/loans/${record.id}`} style={{ display: 'block', width: '100%' }}>
          <Card size="small" className={styles.card}>
            <Flex justify="space-between" align="flex-start">
              <Flex vertical gap={2}>
                <Flex gap={8} align="center">
                  <Typography.Text strong>{record.customer?.fullName}</Typography.Text>
                  <Tag color={STATUS_COLOR[record.status]}>{record.status}</Tag>
                </Flex>
                <Typography.Text className={styles.cardMeta}>{record.lender?.name}</Typography.Text>
                <Typography.Text className={styles.cardMeta}>
                  {t('principal')}: {fmtMoney(record.principal)} ·{' '}
                  {record.tenure} {TENURE_TYPE_LABEL[record.tenureType] ?? record.tenureType}
                </Typography.Text>
                <Typography.Text className={styles.cardMeta}>
                  {t('repaymentType')}: <Tag style={{ marginLeft: 0 }}>{record.repaymentType}</Tag>
                </Typography.Text>
                <Typography.Text className={styles.cardMeta}>
                  {t('interestTotal')}: {fmtMoney(record.interestAmount)}
                </Typography.Text>
              </Flex>
              <RightOutlined style={{ color: '#bfbfbf', marginTop: 4 }} />
            </Flex>
          </Card>
        </Link>
      )}
    />
  );
}
