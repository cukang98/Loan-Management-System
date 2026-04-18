import { GET, POST, PATCH, DELETE } from '@/lib/request';

import type { LenderDto, PaginatedData } from '@ck-loan/shared';

// ---------- Query Key Factory ----------

export const lendersKeys = {
  all: ['lenders'],
  lists: () => [...lendersKeys.all, 'list'],
  list: (query: LenderQuery) => [...lendersKeys.lists(), query],
};

// ---------- Payload Types ----------

export interface LenderQuery {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}

export interface CreateLenderPayload {
  userId: string;
  name: string;
  email?: string | null;
  password: string;
  availableCapital: number | string;
}

export interface UpdateLenderPayload {
  name?: string;
  email?: string | null;
  availableCapital?: number | string;
  isActive?: boolean;
}

// ---------- Service Functions ----------

export const getLenders = (
  query: LenderQuery = {},
): Promise<PaginatedData<LenderDto>> =>
  GET<PaginatedData<LenderDto>>('/lenders', {
    params: { pageIndex: 1, pageSize: 10, ...query },
  });

export const createLender = (data: CreateLenderPayload): Promise<LenderDto> =>
  POST<LenderDto>('/lenders', data);

export const updateLenderById = (
  id: string,
  data: UpdateLenderPayload,
): Promise<LenderDto> => PATCH<LenderDto>(`/lenders/${id}`, data);

export const deleteLenderById = (id: string): Promise<void> =>
  DELETE(`/lenders/${id}`);
