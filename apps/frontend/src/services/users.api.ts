import { GET, POST, PATCH, DELETE } from '@/lib/request';

import type { UserDto, PaginatedData } from '@ck-loan/shared';

// ---------- Query Key Factory ----------

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (query: UserQuery) => [...usersKeys.lists(), query] as const,
};

// ---------- Payload Types ----------

export interface UserQuery {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}

export interface CreateUserPayload {
  userId: string;
  name: string;
  email?: string | null;
  password: string;
  userGroupId?: string | null;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string | null;
  password?: string;
  userGroupId?: string | null;
  isActive?: boolean;
}

// ---------- Service Functions ----------

export const getUsers = (
  query: UserQuery = {},
): Promise<PaginatedData<UserDto>> =>
  GET<PaginatedData<UserDto>>('/users', {
    params: { pageIndex: 1, pageSize: 10, ...query },
  });

export const createUser = (data: CreateUserPayload): Promise<UserDto> =>
  POST<UserDto>('/users', data);

export const updateUserById = (
  id: string,
  data: UpdateUserPayload,
): Promise<UserDto> => PATCH<UserDto>(`/users/${id}`, data);

export const deleteUserById = (id: string): Promise<void> =>
  DELETE(`/users/${id}`);
