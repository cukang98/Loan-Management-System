import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { App } from 'antd';

import type { AxiosError } from 'axios';

import {
  usersKeys,
  getUsers,
  createUser,
  updateUserById,
  deleteUserById,
} from '@/services/users.api';

import type { UserQuery, CreateUserPayload, UpdateUserPayload } from '@/services/users.api';

type ApiError = AxiosError<{ message?: string }>;

export { UserQuery };

export const useUsers = (query: UserQuery = {}) =>
  useQuery({
    queryKey: usersKeys.list(query),
    queryFn: () => getUsers(query),
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: CreateUserPayload) => createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.lists() });
      message.success('用户已创建');
    },
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '操作失败'),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      updateUserById(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.lists() });
      message.success('用户已更新');
    },
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '操作失败'),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (id: string) => deleteUserById(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.lists() });
      message.success('用户已删除');
    },
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '操作失败'),
  });
};
