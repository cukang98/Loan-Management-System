import { GET, POST, PATCH } from '@/lib/request';

import type {
  LoanDto,
  RepaymentDto,
  RepaymentScheduleDto,
  PaginatedData,
  InterestModel,
  TenureType,
  RepaymentType,
} from '@ck-loan/shared';

// ---------- Query Key Factory ----------

export const loansKeys = {
  all: ['loans'],
  lists: () => [...loansKeys.all, 'list'],
  list: (query: LoanQuery) => [...loansKeys.lists(), query],
  details: () => [...loansKeys.all, 'detail'],
  detail: (id: string) => [...loansKeys.details(), id],
};

// ---------- Payload Types ----------

export interface LoanQuery {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  lenderId?: string;
  customerId?: string;
}

export interface CreateLoanPayload {
  customerId: string;
  lenderId: string;
  principal: number | string;
  tenure: number;
  tenureType: TenureType;
  repaymentType: RepaymentType;
  interestModel?: InterestModel;
  interestRate?: number | string;
  interestAmount?: number | string;
  startDate: string;
}

export interface PreviewLoanPayload {
  principal: number | string;
  tenure: number;
  tenureType: TenureType;
  repaymentType: RepaymentType;
  interestModel?: InterestModel;
  interestRate?: number | string;
  interestAmount?: number | string;
  startDate: string;
}

export interface PreviewLoanResponse {
  interestRate: string;
  interestAmount: string;
  schedule: RepaymentScheduleDto[];
}

export interface UpdateLoanPayload {
  status?: string;
  notes?: string;
}

export type LoanWithDetails = LoanDto & {
  repayments?: RepaymentDto[];
  schedules?: RepaymentScheduleDto[];
};

// ---------- Service Functions ----------

export const getLoans = (
  query: LoanQuery = {},
): Promise<PaginatedData<LoanDto>> =>
  GET<PaginatedData<LoanDto>>('/loans', {
    params: { pageIndex: 1, pageSize: 10, ...query },
  });

export const getLoanById = (id: string): Promise<LoanWithDetails> =>
  GET<LoanWithDetails>(`/loans/${id}`);

export const createLoan = (data: CreateLoanPayload): Promise<LoanDto> =>
  POST<LoanDto>('/loans', data);

export const previewLoan = (data: PreviewLoanPayload): Promise<PreviewLoanResponse> =>
  POST<PreviewLoanResponse>('/loans/preview', data);

export const updateLoanById = (
  id: string,
  data: UpdateLoanPayload,
): Promise<LoanDto> => PATCH<LoanDto>(`/loans/${id}`, data);
