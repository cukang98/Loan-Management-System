'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button, Col, Form, Result, Row, Skeleton } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { useLoan } from '@/hooks/useLoans';
import { useCreateRepayment } from '@/hooks/useRepayments';
import type { Dayjs } from 'dayjs';
import type { PaymentMethod } from '@ck-loan/shared';
import styles from './page.module.css';

import { LoanDetailCard } from './components/LoanDetailCard';
import { RepaymentHistoryCard } from './components/RepaymentHistoryCard';
import { RepaymentScheduleTable } from './components/RepaymentScheduleTable';
import { RecordRepaymentModal } from './components/RecordRepaymentModal';

interface RepaymentFormValues {
  amount: number;
  paymentDate: Dayjs;
  method?: PaymentMethod;
  notes?: string;
}

const LoanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('loans');
  const [form] = Form.useForm<RepaymentFormValues>();
  const [repayModalOpen, setRepayModalOpen] = useState(false);

  const { data: loan, isLoading } = useLoan(id);
  const createRepayment = useCreateRepayment();

  const handleRepayment = async (values: RepaymentFormValues) => {
    await createRepayment.mutateAsync({
      loanId: id,
      amount: values.amount,
      paymentDate: values.paymentDate.format('YYYY-MM-DD'),
      method: values.method,
      notes: values.notes,
    });
    setRepayModalOpen(false);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      await handleRepayment(values);
    } catch {
      // Form validation error
    }
  };

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (!loan) {
    return (
      <Result
        status="404"
        title="Loan not found"
        extra={<Link href="/loans"><Button type="primary">{t('backToLoans')}</Button></Link>}
      />
    );
  }

  return (
    <>
      <Link href="/loans">
        <Button icon={<ArrowLeftOutlined />} type="link" className={styles.backBtn}>
          {t('backToLoans')}
        </Button>
      </Link>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <LoanDetailCard loan={loan} />
        </Col>

        <Col xs={24} lg={10}>
          <RepaymentHistoryCard loan={loan} onRecordRepayment={() => setRepayModalOpen(true)} />
        </Col>

        <Col xs={24}>
          <RepaymentScheduleTable schedules={loan.schedules || []} />
        </Col>
      </Row>

      <RecordRepaymentModal
        open={repayModalOpen}
        form={form}
        loading={createRepayment.isPending}
        onClose={() => { setRepayModalOpen(false); form.resetFields(); }}
        onOk={handleModalOk}
      />
    </>
  );
};

export default LoanDetailPage;
