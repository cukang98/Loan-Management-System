import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { App } from 'antd';

import type { AxiosError } from 'axios';

import {
  repaymentsKeys,
  getRepayments,
  createRepayment,
} from '@/services/repayments.api';
import { loansKeys } from '@/services/loans.api';

import type { RepaymentQuery, CreateRepaymentPayload } from '@/services/repayments.api';

type ApiError = AxiosError<{ message?: string }>;

export { RepaymentQuery };

export const useRepayments = (query: RepaymentQuery = {}) =>
  useQuery({
    queryKey: repaymentsKeys.list(query),
    queryFn: () => getRepayments(query),
  });

export const useCreateRepayment = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: CreateRepaymentPayload) => createRepayment(data),
    onSuccess: (_data, { loanId }) => {
      qc.invalidateQueries({ queryKey: repaymentsKeys.lists() });
      qc.invalidateQueries({ queryKey: loansKeys.lists() });
      qc.invalidateQueries({ queryKey: loansKeys.detail(loanId) });
      message.success('还款记录已添加');
    },
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '操作失败'),
  });
};
