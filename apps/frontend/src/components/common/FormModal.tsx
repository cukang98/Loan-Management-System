'use client';

import { Modal, Form, Button, Space } from 'antd';
import { useTranslations } from 'next-intl';
import type { FormInstance } from 'antd';
import type { ReactNode } from 'react';

interface FormModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (values: unknown) => Promise<void>;
  form: FormInstance;
  children: ReactNode;
  loading?: boolean;
  width?: number;
}

export function FormModal({
  open,
  title,
  onClose,
  onSubmit,
  form,
  children,
  loading = false,
  width = 560,
}: FormModalProps) {
  const t = useTranslations('common');

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={title}
      onCancel={handleClose}
      width={width}
      footer={
        <Space>
          <Button onClick={handleClose}>{t('cancel')}</Button>
          <Button type="primary" loading={loading} onClick={handleOk}>
            {t('save')}
          </Button>
        </Space>
      }
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
      >
        {children}
      </Form>
    </Modal>
  );
}
