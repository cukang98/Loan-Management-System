// antd
import { Form, Input, Select, Switch, FormInstance } from 'antd';

// next-intl
import { useTranslations } from 'next-intl';

// components
import { FormModal } from '@/components/common';

interface UserFormModalProps {
  open: boolean;
  editId: string | null;
  form: FormInstance;
  loading: boolean;
  groups: any[];
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export function UserFormModal({ open, editId, form, loading, groups, onClose, onSubmit }: UserFormModalProps) {
  const t = useTranslations('users');

  return (
    <FormModal
      open={open}
      title={editId ? t('editUser') : t('addUser')}
      form={form}
      onClose={onClose}
      onSubmit={onSubmit}
      loading={loading}
    >
      <Form.Item name="name" label={t('name')} rules={[{ required: true }]}><Input /></Form.Item>
      {!editId && (
        <Form.Item name="userId" label={t('userId')} rules={[{ required: true }]}><Input /></Form.Item>
      )}
      <Form.Item name="email" label={t('email')} rules={[{ type: 'email' }]}><Input /></Form.Item>
      {!editId && (
        <Form.Item name="password" label={t('password')} rules={[{ required: true, min: 8 }]}>
          <Input.Password />
        </Form.Item>
      )}
      <Form.Item name="userGroupId" label={t('userGroup')}>
        <Select allowClear options={groups?.map((g: any) => ({ label: g.name, value: g.id }))} />
      </Form.Item>
      <Form.Item name="isActive" label={t('isActive')} valuePropName="checked" initialValue={true}>
        <Switch />
      </Form.Item>
    </FormModal>
  );
}
