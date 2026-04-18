import { DatePicker, Form, Input, InputNumber, Modal, Select, FormInstance } from 'antd';
import { useTranslations } from 'next-intl';
import { PaymentMethod } from '@ck-loan/shared';

interface RecordRepaymentModalProps {
  open: boolean;
  form: FormInstance;
  loading: boolean;
  onClose: () => void;
  onOk: () => Promise<void>;
}

export function RecordRepaymentModal({ open, form, loading, onClose, onOk }: RecordRepaymentModalProps) {
  const t = useTranslations('loans');
  const tr = useTranslations('repayments');

  return (
    <Modal
      open={open}
      title={t('recordRepayment')}
      onCancel={onClose}
      onOk={onOk}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="amount" label={tr('amount')} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0.01} step={0.01} prefix="RM" />
        </Form.Item>
        <Form.Item name="paymentDate" label={tr('paymentDate')} rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="method" label={tr('method')}>
          <Select allowClear options={[
            { label: tr('methodCash'), value: PaymentMethod.CASH },
            { label: tr('methodBankTransfer'), value: PaymentMethod.BANK_TRANSFER },
            { label: tr('methodMobileMoney'), value: PaymentMethod.MOBILE_MONEY },
            { label: tr('methodOther'), value: PaymentMethod.OTHER },
          ]} />
        </Form.Item>
        <Form.Item name="notes" label={tr('notes')}>
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
