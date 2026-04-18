import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { App } from 'antd';

import type { AxiosError } from 'axios';

import {
  userGroupsKeys,
  getUserGroups,
  getUserGroupById,
  createUserGroup,
  updateUserGroupById,
  deleteUserGroupById,
} from '@/services/user-groups.api';

import type {
  UserGroupQuery,
  CreateUserGroupPayload,
  UpdateUserGroupPayload,
} from '@/services/user-groups.api';

type ApiError = AxiosError<{ message?: string }>;

export { UserGroupQuery };

export const useUserGroups = (query: UserGroupQuery = {}) =>
  useQuery({
    queryKey: userGroupsKeys.list(query),
    queryFn: () => getUserGroups(query),
  });

export const useUserGroup = (id: string) =>
  useQuery({
    queryKey: userGroupsKeys.detail(id),
    queryFn: () => getUserGroupById(id),
    enabled: !!id,
  });

export const useCreateUserGroup = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: CreateUserGroupPayload) => createUserGroup(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userGroupsKeys.lists() });
      message.success('用户组已创建');
    },
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '操作失败'),
  });
};

export const useUpdateUserGroup = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserGroupPayload }) =>
      updateUserGroupById(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: userGroupsKeys.lists() });
      qc.invalidateQueries({ queryKey: userGroupsKeys.detail(id) });
      message.success('用户组已更新');
    },
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '操作失败'),
  });
};

export const useDeleteUserGroup = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (id: string) => deleteUserGroupById(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userGroupsKeys.lists() });
      message.success('用户组已删除');
    },
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '操作失败'),
  });
};
