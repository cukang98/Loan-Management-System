'use client';

import { useState } from 'react';

// antd
import { Button, Form, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

// next-intl
import { useTranslations } from 'next-intl';

// components
import { PageHeader, PermissionGuard } from '@/components/common';

// hooks
import { useLoans } from '@/hooks/useLoans';

// components
import { LoanTable } from './components/LoanTable';
import LoanFormModal from './components/LoanFormModal';

const LoansPage: React.FC = () => {
  const t = useTranslations('loans');
  const [form] = Form.useForm();
  const [pageIndex, setPageIndex] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useLoans({ pageIndex, status: statusFilter });

  return (
    <>
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

      <LoanTable
        data={data?.items || []}
        isLoading={isLoading}
        total={data?.pagination?.totalItem}
        pageIndex={pageIndex}
        onPageChange={setPageIndex}
      />

      <LoanFormModal
        open={modalOpen}
        form={form}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default LoansPage;
