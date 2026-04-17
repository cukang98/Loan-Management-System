import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { AxiosError } from 'axios';
import api from '@/lib/axios';
import type { RepaymentDto, PaginatedData } from '@ck-loan/shared';

interface RepaymentQuery { page?: number; limit?: number; loanId?: string; }

type ApiErrorResponse = AxiosError<{ message?: string }>;

export const useRepayments = (query: RepaymentQuery = {}) =>
  useQuery<PaginatedData<RepaymentDto>>({
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
    onError: (err: ApiErrorResponse) => message.error(err?.response?.data?.message || '操作失败'),
  });
};
