"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";

// components
import UserTable from "./components/UserTable";
import UserFormModal from "./components/UserFormModal";
import { PageHeader, PermissionGuard } from "@/components/common";

// hooks
import { useUserGroups } from "@/hooks/useUserGroups";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/useUsers";

const UsersPage: React.FC = () => {
  const t = useTranslations("users");
  const [form] = Form.useForm();
  const [pageIndex, setPageIndex] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading } = useUsers({ pageIndex, search });
  const { data: groups } = useUserGroups({ pageSize: 100 });
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const openCreate = () => {
    form.resetFields();
    setEditId(null);
    setModalOpen(true);
  };
  const openEdit = (record: any) => {
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      userGroupId: record.userGroupId,
      isActive: record.isActive,
    });
    setEditId(record.id);
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (editId) {
      await updateMutation.mutateAsync({ id: editId, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setModalOpen(false);
  };

  return (
    <>
      <PageHeader
        title={t("title")}
        actions={
          <PermissionGuard module="users" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t("addUser")}
            </Button>
          </PermissionGuard>
        }
      />
      <UserTable
        data={data?.items || []}
        isLoading={isLoading}
        pageIndex={pageIndex}
        total={data?.pagination?.totalItem}
        onSearch={setSearch}
        onPageChange={setPageIndex}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
      <UserFormModal
        open={modalOpen}
        editId={editId}
        form={form}
        loading={createMutation.isPending || updateMutation.isPending}
        groups={groups?.items || []}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default UsersPage;
