'use client';

import { useState } from 'react';
import { LoanStatus } from '@ck-loan/shared';
import { useTranslations } from 'next-intl';
import { Button, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { PageHeader, PermissionGuard } from '@/components/common';
import { useLoans } from '@/hooks/useLoans';
import { useRepayments, useCreateRepayment } from '@/hooks/useRepayments';

import { RepaymentTable } from './components/RepaymentTable';
import { RepaymentFormModal } from './components/RepaymentFormModal';

const RepaymentsPage: React.FC = () => {
  const t = useTranslations('repayments');
  const [form] = Form.useForm();
  const [pageIndex, setPageIndex] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useRepayments({ pageIndex });
  const { data: loansData } = useLoans({ pageSize: 100, status: LoanStatus.ACTIVE });
  const createMutation = useCreateRepayment();

  const handleSubmit = async (values: any) => {
    await createMutation.mutateAsync({
      ...values,
      paymentDate: values.paymentDate.format('YYYY-MM-DD'),
    });
    setModalOpen(false);
    form.resetFields();
  };

  return (
    <>
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

      <RepaymentTable
        data={data?.items || []}
        isLoading={isLoading}
        total={data?.pagination?.totalItem}
        pageIndex={pageIndex}
        onPageChange={setPageIndex}
      />

      <RepaymentFormModal
        open={modalOpen}
        form={form}
        loading={createMutation.isPending}
        loansData={loansData}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default RepaymentsPage;
