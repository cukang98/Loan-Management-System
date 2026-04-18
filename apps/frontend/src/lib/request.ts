import { type AxiosRequestConfig } from 'axios';

import http from './http';

export const GET = <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  http.get<unknown, T>(url, config);

export const POST = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => http.post<unknown, T>(url, data, config);

export const PUT = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => http.put<unknown, T>(url, data, config);

export const PATCH = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => http.patch<unknown, T>(url, data, config);

export const DELETE = <T = void>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => http.delete<unknown, T>(url, config);
