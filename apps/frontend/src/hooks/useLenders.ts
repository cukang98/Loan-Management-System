import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { App } from 'antd';

import type { AxiosError } from 'axios';

import {
  lendersKeys,
  getLenders,
  createLender,
  updateLenderById,
  deleteLenderById,
} from '@/services/lenders.api';

import type { LenderQuery, CreateLenderPayload, UpdateLenderPayload } from '@/services/lenders.api';

type ApiError = AxiosError<{ message?: string }>;

export { LenderQuery };

export const useLenders = (query: LenderQuery = {}) =>
  useQuery({
    queryKey: lendersKeys.list(query),
    queryFn: () => getLenders(query),
  });

export const useCreateLender = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: CreateLenderPayload) => createLender(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lendersKeys.lists() });
      message.success('贷款方已创建');
    },
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '操作失败'),
  });
};

export const useUpdateLender = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLenderPayload }) =>
      updateLenderById(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lendersKeys.lists() });
      message.success('贷款方已更新');
    },
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '操作失败'),
  });
};

export const useDeleteLender = () => {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (id: string) => deleteLenderById(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lendersKeys.lists() });
      message.success('贷款方已删除');
    },
    onError: (err: ApiError) =>
      message.error(err?.response?.data?.message || '操作失败'),
  });
};
