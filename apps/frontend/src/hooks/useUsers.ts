import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { AxiosError } from 'axios';
import api from '@/lib/axios';
import type { UserDto, PaginatedData } from '@ck-loan/shared';

interface UserQuery { page?: number; limit?: number; search?: string; }

type ApiErrorResponse = AxiosError<{ message?: string }>;

export const useUsers = (query: UserQuery = {}) =>
  useQuery<PaginatedData<UserDto>>({
    queryKey: ['users', query],
    queryFn: async () => {
      const res = await api.get('/users', { params: query });
      return res.data.data;
    },
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/users', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); message.success('用户已创建'); },
    onError: (err: ApiErrorResponse) => message.error(err?.response?.data?.message || '操作失败'),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.patch(`/users/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); message.success('用户已更新'); },
    onError: () => message.error('操作失败'),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); message.success('用户已删除'); },
    onError: () => message.error('操作失败'),
  });
};
