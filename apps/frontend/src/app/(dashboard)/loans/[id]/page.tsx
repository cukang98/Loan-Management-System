'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Card, Row, Col, Tag, Descriptions, Timeline, Button,
  Form, InputNumber, DatePicker, Input, Modal, Skeleton,
} from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLoan } from '@/hooks/useLoans';
import { useCreateRepayment } from '@/hooks/useRepayments';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { LoanStatus } from '@ck-loan/shared';

const fmtMoney = (v: string | number) =>
  `RM ${Number(v).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;
const fmtDate = (v: string) => new Date(v).toLocaleDateString('zh-CN');

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'blue', COMPLETED: 'green', DEFAULTED: 'red',
};

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('loans');
  const tr = useTranslations('repayments');
  const [form] = Form.useForm();
  const [repayModalOpen, setRepayModalOpen] = useState(false);

  const { data: loan, isLoading } = useLoan(id);
  const createRepayment = useCreateRepayment();

  const handleRepayment = async (values: any) => {
    await createRepayment.mutateAsync({
      loanId: id,
      paidAmount: values.paidAmount,
      paidAt: values.paidAt.format('YYYY-MM-DD'),
      overdueDays: values.overdueDays || 0,
      notes: values.notes,
    });
    setRepayModalOpen(false);
    form.resetFields();
  };

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (!loan) return <div>Loan not found</div>;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link href="/loans">
          <Button icon={<ArrowLeftOutlined />} type="link" style={{ paddingLeft: 0 }}>
            返回贷款列表
          </Button>
        </Link>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={`贷款详情 — ${loan.customer?.fullName}`}
            extra={<Tag color={STATUS_COLOR[loan.status]}>{loan.status}</Tag>}
            style={{ borderRadius: 12 }}
          >
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label={t('customer')}>{loan.customer?.fullName}</Descriptions.Item>
              <Descriptions.Item label={t('lender')}>{loan.lender?.name}</Descriptions.Item>
              <Descriptions.Item label={t('principal')}>{fmtMoney(loan.principal)}</Descriptions.Item>
              <Descriptions.Item label={t('interestRate')}>{loan.interestRate}%</Descriptions.Item>
              <Descriptions.Item label={t('tenureMonths')}>{loan.tenureMonths} 月</Descriptions.Item>
              <Descriptions.Item label={t('repaymentFrequency')}>{loan.repaymentFrequency}</Descriptions.Item>
              <Descriptions.Item label={t('interestModel')}>{loan.interestModel}</Descriptions.Item>
              <Descriptions.Item label={t('startDate')}>{fmtDate(loan.startDate)}</Descriptions.Item>
              <Descriptions.Item label={t('totalRepayment')}>{fmtMoney(loan.totalRepayment)}</Descriptions.Item>
              <Descriptions.Item label={t('installmentAmount')}>{fmtMoney(loan.installmentAmount)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title="还款记录"
            style={{ borderRadius: 12 }}
            extra={
              <PermissionGuard module="repayments" action="create">
                {loan.status === LoanStatus.ACTIVE && (
                  <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setRepayModalOpen(true)}>
                    {t('recordRepayment')}
                  </Button>
                )}
              </PermissionGuard>
            }
          >
            {loan.repayments?.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', padding: 24 }}>暂无还款记录</div>
            ) : (
              <Timeline
                items={loan.repayments?.map((r: any) => ({
                  color: r.overdueDays > 0 ? 'red' : 'green',
                  children: (
                    <div>
                      <div><strong>{fmtDate(r.paidAt)}</strong> — {fmtMoney(r.paidAmount)}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        余额: {fmtMoney(r.remainingBalance)}
                        {r.overdueDays > 0 && <Tag color="red" style={{ marginLeft: 8 }}>逾期 {r.overdueDays} 天</Tag>}
                      </div>
                    </div>
                  ),
                }))}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        open={repayModalOpen}
        title={t('recordRepayment')}
        onCancel={() => setRepayModalOpen(false)}
        onOk={async () => { const v = await form.validateFields(); await handleRepayment(v); }}
        confirmLoading={createRepayment.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="paidAmount" label={tr('paidAmount')} rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0.01} prefix="RM" />
          </Form.Item>
          <Form.Item name="paidAt" label={tr('paidAt')} rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="overdueDays" label={tr('overdueDays')}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="notes" label={tr('notes')}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
