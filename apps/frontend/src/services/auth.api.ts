import { POST } from '@/lib/request';

import type { AuthUserDto } from '@ck-loan/shared';

// ---------- Payload Types ----------

export interface LoginPayload {
  userId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUserDto;
}

// ---------- Service Functions ----------

export const login = (data: LoginPayload): Promise<LoginResponse> =>
  POST<LoginResponse>('/auth/login', data);

export const logout = (): Promise<void> =>
  POST<void>('/auth/logout');

export const refreshToken = (): Promise<{ accessToken: string }> =>
  POST<{ accessToken: string }>('/auth/refresh');
