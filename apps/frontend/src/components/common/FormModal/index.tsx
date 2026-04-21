"use client";

import type { ReactNode } from "react";

import { useTranslations } from "next-intl";

import { Modal, Drawer, Form, Button, Flex, Grid } from "antd";
import type { FormInstance } from "antd";

import styles from "./FormModal.module.css";

const { useBreakpoint } = Grid;

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

const FormModal: React.FC<FormModalProps> = ({
  open,
  title,
  onClose,
  onSubmit,
  form,
  children,
  loading = false,
  width = 560,
}) => {
  const t = useTranslations("common");
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch {
      // Ant Design already displays field-level validation errors
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const footer = (
    <Flex justify="flex-end" gap={8}>
      <Button onClick={handleClose}>{t("cancel")}</Button>
      <Button type="primary" loading={loading} onClick={handleOk}>
        {t("save")}
      </Button>
    </Flex>
  );

  const formContent = (
    <Form form={form} layout="vertical" className={styles.form}>
      {children}
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer
        open={open}
        title={title}
        placement="bottom"
        height="100%"
        onClose={handleClose}
        footer={footer}
        destroyOnClose
      >
        {formContent}
      </Drawer>
    );
  }

  return (
    <Modal
      open={open}
      title={title}
      onCancel={handleClose}
      width={width}
      footer={footer}
      destroyOnClose
    >
      {formContent}
    </Modal>
  );
};

export default FormModal;
