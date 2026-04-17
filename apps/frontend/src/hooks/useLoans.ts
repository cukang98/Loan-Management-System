import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { AxiosError } from 'axios';
import api from '@/lib/axios';
import type { LoanDto, PaginatedData } from '@ck-loan/shared';

interface LoanQuery {
  page?: number; limit?: number; search?: string;
  status?: string; lenderId?: string; customerId?: string;
}

type ApiErrorResponse = AxiosError<{ message?: string }>;

export const useLoans = (query: LoanQuery = {}) =>
  useQuery<PaginatedData<LoanDto>>({
    queryKey: ['loans', 'list', query],
    queryFn: async () => {
      const res = await api.get('/loans', { params: query });
      return res.data.data;
    },
  });

export const useLoan = (id: string) =>
  useQuery<LoanDto & { repayments?: import('@ck-loan/shared').RepaymentDto[] }>({
    queryKey: ['loans', 'detail', id],
    queryFn: async () => {
      const res = await api.get(`/loans/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

export const useCreateLoan = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/loans', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] });
      qc.invalidateQueries({ queryKey: ['lenders'] });
      message.success('贷款已创建');
    },
    onError: (err: ApiErrorResponse) =>
      message.error(err?.response?.data?.message || '操作失败'),
  });
};

export const useUpdateLoan = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      api.patch(`/loans/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] });
      message.success('贷款已更新');
    },
    onError: () => message.error('操作失败'),
  });
};
