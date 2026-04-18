import { Button, Card, Flex, Timeline, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { PermissionGuard } from '@/components/common';
import { LoanStatus } from '@ck-loan/shared';
import { fmtMoney, fmtDate } from '@/lib/utils';
import styles from '../../page.module.css';

export function RepaymentHistoryCard({ loan, onRecordRepayment }: { loan: any; onRecordRepayment: () => void }) {
  const t = useTranslations('loans');

  return (
    <Card
      title={t('repaymentHistory')}
      style={{ borderRadius: 12 }}
      extra={
        <PermissionGuard module="repayments" action="create">
          {loan.status === LoanStatus.ACTIVE && (
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={onRecordRepayment}
            >
              {t('recordRepayment')}
            </Button>
          )}
        </PermissionGuard>
      }
    >
      {!loan.repayments?.length ? (
        <Typography.Text type="secondary" className={styles.noRepayments}>
          {t('noRepayments')}
        </Typography.Text>
      ) : (
        <Timeline
          items={loan.repayments.map((r: any) => ({
            color: 'green',
            children: (
              <Flex vertical gap={2}>
                <Typography.Text>
                  <strong>{fmtDate(r.paymentDate)}</strong> — {fmtMoney(r.amount)}
                </Typography.Text>
                {r.method && (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {r.method}
                  </Typography.Text>
                )}
                {r.notes && (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {r.notes}
                  </Typography.Text>
                )}
              </Flex>
            ),
          }))}
        />
      )}
    </Card>
  );
}
