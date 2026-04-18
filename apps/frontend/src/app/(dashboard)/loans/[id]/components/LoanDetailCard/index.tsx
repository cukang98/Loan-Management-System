import { Card, Descriptions, Tag } from 'antd';
import { useTranslations } from 'next-intl';
import { fmtMoney, fmtDate } from '@/lib/utils';

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'blue', COMPLETED: 'green', DEFAULTED: 'red',
};

export function LoanDetailCard({ loan }: { loan: any }) {
  const t = useTranslations('loans');
  const TENURE_TYPE_LABEL: Record<string, string> = {
    DAY: t('tenureDay'), WEEK: t('tenureWeek'), MONTH: t('tenureMonth'),
  };

  return (
    <Card
      title={`${t('detailTitle')} — ${loan.customer?.fullName}`}
      extra={<Tag color={STATUS_COLOR[loan.status]}>{loan.status}</Tag>}
      style={{ borderRadius: 12 }}
    >
      <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
        <Descriptions.Item label={t('customer')}>{loan.customer?.fullName}</Descriptions.Item>
        <Descriptions.Item label={t('lender')}>{loan.lender?.name}</Descriptions.Item>
        <Descriptions.Item label={t('principal')}>{fmtMoney(loan.principal)}</Descriptions.Item>
        <Descriptions.Item label={t('interestRate')}>{loan.interestRate}%</Descriptions.Item>
        <Descriptions.Item label={t('interestTotal')}>{fmtMoney(loan.interestAmount)}</Descriptions.Item>
        <Descriptions.Item label={t('tenure')}>
          {loan.tenure} {TENURE_TYPE_LABEL[loan.tenureType] ?? loan.tenureType}
        </Descriptions.Item>
        <Descriptions.Item label={t('repaymentType')}>{loan.repaymentType}</Descriptions.Item>
        <Descriptions.Item label={t('interestModel')}>{loan.interestModel}</Descriptions.Item>
        <Descriptions.Item label={t('startDate')}>{fmtDate(loan.startDate)}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
