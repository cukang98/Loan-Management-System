// next-intl
import { useTranslations } from 'next-intl';

// antd
import type { FormInstance } from 'antd';
import { Form, Input } from 'antd';

// components
import { FormModal } from '@/components/common';

interface CustomerFormModalProps {
  open: boolean;
  editId: string | null;
  form: FormInstance;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ open, editId, form, loading, onClose, onSubmit }) => {
  const t = useTranslations('customers');

  return (
    <FormModal
      open={open}
      title={editId ? t('editCustomer') : t('addCustomer')}
      form={form}
      onClose={onClose}
      onSubmit={onSubmit}
      loading={loading}
    >
      <Form.Item name="fullName" label={t('fullName')} rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="phone" label={t('phone')} rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="email" label={t('email')} rules={[{ type: 'email' }]}><Input /></Form.Item>
      <Form.Item name="address" label={t('address')}><Input /></Form.Item>
      <Form.Item name="notes" label={t('notes')}><Input.TextArea rows={3} /></Form.Item>
    </FormModal>
  );
}

export default CustomerFormModal;