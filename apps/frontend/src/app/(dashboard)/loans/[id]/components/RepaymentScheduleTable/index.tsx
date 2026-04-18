import { Card, Table, Tag, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { fmtMoney, fmtDate } from '@/lib/utils';
import styles from '../../page.module.css';

const SCHEDULE_STATUS_COLOR: Record<string, string> = {
  PENDING: 'default', PARTIAL: 'orange', PAID: 'green', OVERDUE: 'red',
};

export function RepaymentScheduleTable({ schedules }: { schedules: any[] }) {
  const t = useTranslations('loans');

  const scheduleColumns = [
    { title: t('installmentNo'), dataIndex: 'installmentNo', key: 'installmentNo', width: 50 },
    { title: t('dueDate'), dataIndex: 'dueDate', key: 'dueDate', render: fmtDate },
    { title: t('principalDue'), dataIndex: 'principalDue', key: 'principalDue', render: fmtMoney },
    { title: t('interestDue'), dataIndex: 'interestDue', key: 'interestDue', render: fmtMoney },
    { title: t('totalDue'), dataIndex: 'totalDue', key: 'totalDue', render: fmtMoney },
    { title: t('paidAmount'), dataIndex: 'paidAmount', key: 'paidAmount', render: fmtMoney },
    {
      title: t('scheduleStatus'), dataIndex: 'status', key: 'status',
      render: (v: string) => (
        <Tag color={SCHEDULE_STATUS_COLOR[v]}>
          {t(`status${v.charAt(0) + v.slice(1).toLowerCase()}` as any) ?? v}
        </Tag>
      ),
    },
  ];

  return (
    <Card title={t('repaymentSchedule')} style={{ borderRadius: 12 }}>
      {!schedules?.length ? (
        <Typography.Text type="secondary">{t('noSchedule')}</Typography.Text>
      ) : (
        <Table
          dataSource={schedules}
          columns={scheduleColumns}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 600 }}
          rowClassName={(r: any) =>
            r.status === 'OVERDUE' ? styles.overdueRow : ''
          }
        />
      )}
    </Card>
  );
}
