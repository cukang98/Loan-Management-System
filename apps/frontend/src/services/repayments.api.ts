import { GET, POST } from '@/lib/request';

import type { RepaymentDto, PaginatedData, PaymentMethod } from '@ck-loan/shared';

// ---------- Query Key Factory ----------

export const repaymentsKeys = {
  all: ['repayments'] as const,
  lists: () => [...repaymentsKeys.all, 'list'] as const,
  list: (query: RepaymentQuery) => [...repaymentsKeys.lists(), query] as const,
};

// ---------- Payload Types ----------

export interface RepaymentQuery {
  pageIndex?: number;
  pageSize?: number;
  loanId?: string;
}

export interface CreateRepaymentPayload {
  loanId: string;
  amount: number | string;
  paymentDate: string;
  method?: PaymentMethod;
  notes?: string | null;
}

// ---------- Service Functions ----------

export const getRepayments = (
  query: RepaymentQuery = {},
): Promise<PaginatedData<RepaymentDto>> =>
  GET<PaginatedData<RepaymentDto>>('/repayments', {
    params: { pageIndex: 1, pageSize: 10, ...query },
  });

export const createRepayment = (
  data: CreateRepaymentPayload,
): Promise<RepaymentDto> => POST<RepaymentDto>('/repayments', data);
