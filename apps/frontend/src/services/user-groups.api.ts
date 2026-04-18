import { GET, POST, PATCH, DELETE } from '@/lib/request';

import type { UserGroupDto, PermissionDto, PaginatedData } from '@ck-loan/shared';

// ---------- Query Key Factory ----------

export const userGroupsKeys = {
  all: ['user-groups'] as const,
  lists: () => [...userGroupsKeys.all, 'list'] as const,
  list: (query: UserGroupQuery) => [...userGroupsKeys.lists(), query] as const,
  details: () => [...userGroupsKeys.all, 'detail'] as const,
  detail: (id: string) => [...userGroupsKeys.details(), id] as const,
};

// ---------- Payload Types ----------

export interface UserGroupQuery {
  pageIndex?: number;
  pageSize?: number;
}

export interface CreateUserGroupPayload {
  name: string;
  isSuperAdmin?: boolean;
  permissions?: PermissionDto[];
}

export type UpdateUserGroupPayload = Partial<CreateUserGroupPayload>;

// ---------- Service Functions ----------

export const getUserGroups = (
  query: UserGroupQuery = {},
): Promise<PaginatedData<UserGroupDto>> =>
  GET<PaginatedData<UserGroupDto>>('/user-groups', {
    params: { pageIndex: 1, pageSize: 10, ...query },
  });

export const getUserGroupById = (id: string): Promise<UserGroupDto> =>
  GET<UserGroupDto>(`/user-groups/${id}`);

export const createUserGroup = (
  data: CreateUserGroupPayload,
): Promise<UserGroupDto> => POST<UserGroupDto>('/user-groups', data);

export const updateUserGroupById = (
  id: string,
  data: UpdateUserGroupPayload,
): Promise<UserGroupDto> => PATCH<UserGroupDto>(`/user-groups/${id}`, data);

export const deleteUserGroupById = (id: string): Promise<void> =>
  DELETE(`/user-groups/${id}`);
