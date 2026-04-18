import { DatePicker, Form, Input, InputNumber, Select, FormInstance } from 'antd';
import { useTranslations } from 'next-intl';
import { PaymentMethod } from '@ck-loan/shared';
import { FormModal } from '@/components/common';

interface RepaymentFormModalProps {
  open: boolean;
  form: FormInstance;
  loading: boolean;
  loansData: any;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export function RepaymentFormModal({ open, form, loading, loansData, onClose, onSubmit }: RepaymentFormModalProps) {
  const t = useTranslations('repayments');

  return (
    <FormModal
      open={open}
      title={t('addRepayment')}
      form={form}
      onClose={onClose}
      onSubmit={onSubmit}
      loading={loading}
    >
      <Form.Item name="loanId" label="贷款 / Loan" rules={[{ required: true }]}>
        <Select
          showSearch
          optionFilterProp="label"
          options={loansData?.items?.map((l: any) => ({
            label: `${l.customer?.fullName} — RM ${Number(l.principal).toLocaleString()}`,
            value: l.id,
          }))}
        />
      </Form.Item>
      <Form.Item name="amount" label={t('amount')} rules={[{ required: true }]}>
        <InputNumber style={{ width: '100%' }} min={0.01} step={0.01} prefix="RM" />
      </Form.Item>
      <Form.Item name="paymentDate" label={t('paymentDate')} rules={[{ required: true }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="method" label={t('method')}>
        <Select allowClear options={[
          { label: t('methodCash'), value: PaymentMethod.CASH },
          { label: t('methodBankTransfer'), value: PaymentMethod.BANK_TRANSFER },
          { label: t('methodMobileMoney'), value: PaymentMethod.MOBILE_MONEY },
          { label: t('methodOther'), value: PaymentMethod.OTHER },
        ]} />
      </Form.Item>
      <Form.Item name="notes" label={t('notes')}>
        <Input.TextArea rows={2} />
      </Form.Item>
    </FormModal>
  );
}
