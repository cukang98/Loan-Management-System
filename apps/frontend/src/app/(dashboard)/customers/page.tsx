"use client";

import { useState } from "react";

// next-intl
import { useTranslations } from "next-intl";

// antd
import { Button, Form } from "antd";

// antd icons
import { PlusOutlined } from "@ant-design/icons";

// hooks
import CustomerTable from "./components/CustomerTable";
import CustomerFormModal from "./components/CustomerFormModal";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/hooks/useCustomers";

// components
import { PermissionGuard, PageHeader } from "@/components/common";

const CustomersPage: React.FC = () => {
  const t = useTranslations("customers");
  const [form] = Form.useForm();
  const [pageIndex, setPageIndex] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading } = useCustomers({ pageIndex, search });
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const openCreate = () => {
    form.resetFields();
    setEditId(null);
    setModalOpen(true);
  };
  const openEdit = (record: any) => {
    form.setFieldsValue(record);
    setEditId(record.id);
    setModalOpen(true);
  };

  const handleSubmit = async (values: unknown) => {
    if (editId) {
      await updateMutation.mutateAsync({ id: editId, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setModalOpen(false);
    form.resetFields();
  };

  return (
    <>
      <PageHeader
        title={t("title")}
        actions={
          <PermissionGuard module="customers" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t("addCustomer")}
            </Button>
          </PermissionGuard>
        }
      />

      <CustomerTable
        data={data?.items || []}
        isLoading={isLoading}
        pageIndex={pageIndex}
        total={data?.pagination?.totalItem}
        onSearch={setSearch}
        onPageChange={setPageIndex}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      <CustomerFormModal
        open={modalOpen}
        editId={editId}
        form={form}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default CustomersPage;
