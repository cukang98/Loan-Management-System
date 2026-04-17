import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import api from '@/lib/axios';

interface LenderQuery { page?: number; limit?: number; search?: string; }

export const useLenders = (query: LenderQuery = {}) =>
  useQuery({
    queryKey: ['lenders', query],
    queryFn: async () => {
      const res = await api.get('/lenders', { params: query });
      return res.data.data;
    },
  });

export const useCreateLender = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/lenders', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lenders'] }); message.success('贷款方已创建'); },
    onError: () => message.error('操作失败'),
  });
};

export const useUpdateLender = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.patch(`/lenders/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lenders'] }); message.success('贷款方已更新'); },
    onError: () => message.error('操作失败'),
  });
};

export const useDeleteLender = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/lenders/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lenders'] }); message.success('贷款方已删除'); },
    onError: () => message.error('操作失败'),
  });
};
