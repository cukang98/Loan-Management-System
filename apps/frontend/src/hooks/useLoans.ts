import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { App } from 'antd';

import type { AxiosError } from 'axios';

import {
  loansKeys,
  getLoans,
  getLoanById,
  createLoan,
  previewLoan,
  updateLoanById,
} from '@/services/loans.api';
import { lendersKeys } from '@/services/lenders.api';

import type { LoanQuery, CreateLoanPayload, PreviewLoanPayload, UpdateLoanPayload } from '@/services/loans.api';

type ApiError = AxiosError<{ message?: string }>;

export { LoanQuery };

export const useLoans = (query: LoanQuery = {}) =>
  useQuery({
    queryKey: loansKeys.list(query),
    queryFn: () => getLoans(query),
  });

export const useLoan = (id: string) =>
  useQuery({
    queryKey: loansKeys.detail(id),
    queryFn: () => getLoanById(id),
    enabled: !!id,
  });

export const useCreateLoan = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: CreateLoanPayload) => createLoan(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: loansKeys.lists() });
      qc.invalidateQueries({ queryKey: lendersKeys.lists() });
      message.success('贷款已创建');
    },
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '操作失败'),
  });
};

export const usePreviewLoan = () => {
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: PreviewLoanPayload) => previewLoan(data),
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '预览失败'),
  });
};

export const useUpdateLoan = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLoanPayload }) =>
      updateLoanById(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: loansKeys.lists() });
      qc.invalidateQueries({ queryKey: loansKeys.detail(id) });
      message.success('贷款已更新');
    },
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '操作失败'),
  });
};
