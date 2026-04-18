// antd
import { Form, Input, Switch, FormInstance } from 'antd';

// next-intl
import { useTranslations } from 'next-intl';

// components
import { FormModal } from '@/components/common';
import { PermissionMatrix } from '../PermissionMatrix';

interface UserGroupFormModalProps {
  open: boolean;
  editId: string | null;
  form: FormInstance;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
}

const UserGroupFormModal: React.FC<UserGroupFormModalProps> = ({ open, editId, form, loading, onClose, onSubmit }) => {
  const t = useTranslations('userGroups');

  return (
    <FormModal
      open={open}
      title={editId ? t('editGroup') : t('addGroup')}
      form={form}
      onClose={onClose}
      onSubmit={onSubmit}
      loading={loading}
      width={700}
    >
      <Form.Item name="name" label={t('name')} rules={[{ required: true }]}><Input /></Form.Item>

      <Form.Item name="isSuperAdmin" label={t('isSuperAdmin')} valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item name="permKeys" label={t('permissions')}>
        <PermissionMatrix />
      </Form.Item>
    </FormModal>
  );
}

export default UserGroupFormModal;