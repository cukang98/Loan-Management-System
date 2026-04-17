import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import api from '@/lib/axios';

export const useUserGroups = (query: { page?: number; limit?: number } = {}) =>
  useQuery({
    queryKey: ['user-groups', query],
    queryFn: async () => {
      const res = await api.get('/user-groups', { params: query });
      return res.data.data;
    },
  });

export const useUserGroup = (id: string) =>
  useQuery({
    queryKey: ['user-groups', id],
    queryFn: async () => {
      const res = await api.get(`/user-groups/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

export const useCreateUserGroup = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/user-groups', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-groups'] }); message.success('用户组已创建'); },
    onError: () => message.error('操作失败'),
  });
};

export const useUpdateUserGroup = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.patch(`/user-groups/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-groups'] }); message.success('用户组已更新'); },
    onError: () => message.error('操作失败'),
  });
};

export const useDeleteUserGroup = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/user-groups/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-groups'] }); message.success('用户组已删除'); },
    onError: () => message.error('操作失败'),
  });
};
