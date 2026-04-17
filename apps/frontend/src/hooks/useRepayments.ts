import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import api from '@/lib/axios';

interface RepaymentQuery { page?: number; limit?: number; loanId?: string; }

export const useRepayments = (query: RepaymentQuery = {}) =>
  useQuery({
    queryKey: ['repayments', query],
    queryFn: async () => {
      const res = await api.get('/repayments', { params: query });
      return res.data.data;
    },
  });

export const useCreateRepayment = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/repayments', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repayments'] });
      qc.invalidateQueries({ queryKey: ['loans'] });
      message.success('还款记录已添加');
    },
    onError: (err: any) => message.error(err?.response?.data?.message || '操作失败'),
  });
};
