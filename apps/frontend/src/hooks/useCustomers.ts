import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import api from '@/lib/axios';

interface CustomerQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const useCustomers = (query: CustomerQuery = {}) =>
  useQuery({
    queryKey: ['customers', query],
    queryFn: async () => {
      const res = await api.get('/customers', { params: query });
      return res.data.data;
    },
  });

export const useCustomer = (id: string) =>
  useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      const res = await api.get(`/customers/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/customers', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      message.success('客户创建成功 / Customer created');
    },
    onError: () => message.error('操作失败 / Operation failed'),
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      api.patch(`/customers/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      message.success('客户更新成功 / Customer updated');
    },
    onError: () => message.error('操作失败 / Operation failed'),
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      message.success('客户已删除 / Customer deleted');
    },
    onError: () => message.error('操作失败 / Operation failed'),
  });
};
