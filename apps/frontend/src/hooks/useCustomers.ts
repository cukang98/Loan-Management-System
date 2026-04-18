import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { App } from 'antd';

import type { AxiosError } from 'axios';

import {
  customersKeys,
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomerById,
  deleteCustomerById,
} from '@/services/customers.api';

import type { CustomerQuery, CreateCustomerPayload, UpdateCustomerPayload } from '@/services/customers.api';

type ApiError = AxiosError<{ message?: string }>;

export { CustomerQuery };

export const useCustomers = (query: CustomerQuery = {}) =>
  useQuery({
    queryKey: customersKeys.list(query),
    queryFn: () => getCustomers(query),
  });

export const useCustomer = (id: string) =>
  useQuery({
    queryKey: customersKeys.detail(id),
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: CreateCustomerPayload) => createCustomer(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customersKeys.lists() });
      message.success('客户创建成功 / Customer created');
    },
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '操作失败 / Operation failed'),
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerPayload }) =>
      updateCustomerById(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: customersKeys.lists() });
      qc.invalidateQueries({ queryKey: customersKeys.detail(id) });
      message.success('客户更新成功 / Customer updated');
    },
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '操作失败 / Operation failed'),
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (id: string) => deleteCustomerById(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customersKeys.lists() });
      message.success('客户已删除 / Customer deleted');
    },
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '操作失败 / Operation failed'),
  });
};
