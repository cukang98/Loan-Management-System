import { GET, POST, PATCH, DELETE } from '@/lib/request';

import type { CustomerDto, PaginatedData } from '@ck-loan/shared';

// ---------- Query Key Factory ----------

export const customersKeys = {
  all: ['customers'] as const,
  lists: () => [...customersKeys.all, 'list'] as const,
  list: (query: CustomerQuery) => [...customersKeys.lists(), query] as const,
  details: () => [...customersKeys.all, 'detail'] as const,
  detail: (id: string) => [...customersKeys.details(), id] as const,
};

// ---------- Payload Types ----------

export interface CustomerQuery {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}

export interface CreateCustomerPayload {
  fullName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

// ---------- Service Functions ----------

export const getCustomers = (
  query: CustomerQuery = {},
): Promise<PaginatedData<CustomerDto>> =>
  GET<PaginatedData<CustomerDto>>('/customers', {
    params: { pageIndex: 1, pageSize: 10, ...query },
  });

export const getCustomerById = (id: string): Promise<CustomerDto> =>
  GET<CustomerDto>(`/customers/${id}`);

export const createCustomer = (data: CreateCustomerPayload): Promise<CustomerDto> =>
  POST<CustomerDto>('/customers', data);

export const updateCustomerById = (
  id: string,
  data: UpdateCustomerPayload,
): Promise<CustomerDto> => PATCH<CustomerDto>(`/customers/${id}`, data);

export const deleteCustomerById = (id: string): Promise<void> =>
  DELETE(`/customers/${id}`);
