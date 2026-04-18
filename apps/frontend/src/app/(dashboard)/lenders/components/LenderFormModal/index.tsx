import { Form, Input, InputNumber, FormInstance } from 'antd';
import { useTranslations } from 'next-intl';
import { FormModal } from '@/components/common';

interface LenderFormModalProps {
  open: boolean;
  editId: string | null;
  form: FormInstance;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export function LenderFormModal({ open, editId, form, loading, onClose, onSubmit }: LenderFormModalProps) {
  const t = useTranslations('lenders');
  const ta = useTranslations('auth');

  return (
    <FormModal
      open={open}
      title={editId ? t('editLender') : t('addLender')}
      form={form}
      onClose={onClose}
      onSubmit={onSubmit}
      loading={loading}
    >
      {!editId && (
        <>
          <Form.Item name="userId" label={ta('userId')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="password" label={ta('password')} rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
        </>
      )}
      <Form.Item name="name" label={t('name')} rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="availableCapital" label={t('availableCapital')} rules={[{ required: true }]}>
        <InputNumber style={{ width: '100%' }} min={0} prefix="RM" />
      </Form.Item>
    </FormModal>
  );
}
