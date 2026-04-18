import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { getAccessToken, setAccessToken, clearAuth } from './auth';

// ─── Envelope types ───────────────────────────────────────────────────────────

interface ApiSuccessEnvelope {
  success: true;
  data: unknown;
}

interface ApiErrorEnvelope {
  success: false;
  statusCode: number;
  message: string | string[];
  error?: string;
}

// ─── Public error shape ───────────────────────────────────────────────────────

export interface HttpError {
  message: string;
  code: string;
  status: number;
  paramValidations?: string[];
}

// ─── Instance ─────────────────────────────────────────────────────────────────

const LOCALE_KEY = 'ck_loan_locale';

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15_000,
  withCredentials: true,
});

// ─── Request interceptor ──────────────────────────────────────────────────────

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const locale =
    typeof window !== 'undefined'
      ? (localStorage.getItem(LOCALE_KEY) ?? 'zh')
      : 'zh';

  config.headers['Accept-Language'] = locale;

  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─── Refresh-token queue ──────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

// ─── Error normalizer ─────────────────────────────────────────────────────────

function toHttpError(error: unknown): HttpError {
  if (!axios.isAxiosError<ApiErrorEnvelope>(error)) {
    return { message: String(error), code: 'UNKNOWN', status: 0 };
  }

  const data = error.response?.data;
  const status = error.response?.status ?? 0;
  const raw = data?.message ?? error.message;
  const paramValidations = Array.isArray(raw) ? raw : undefined;
  const message = Array.isArray(raw) ? raw.join('; ') : raw;
  const code = data?.error ?? `HTTP_${status}`;

  return { message, code, status, paramValidations };
}

// ─── Response interceptor ─────────────────────────────────────────────────────

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

http.interceptors.response.use(
  (response) => {
    const envelope = response.data as ApiSuccessEnvelope;
    return envelope.success === true ? envelope.data : response.data;
  },
  async (error: AxiosError<ApiErrorEnvelope>) => {
    const original = error.config as RetryConfig | undefined;

    const isAuthEndpoint =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !original?._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) =>
          failedQueue.push({ resolve, reject }),
        ).then((token) => {
          original!.headers.Authorization = `Bearer ${token}`;
          return http(original!);
        });
      }

      original!._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ data: { accessToken: string } }>(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        original!.headers.Authorization = `Bearer ${newToken}`;
        return http(original!);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(toHttpError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(toHttpError(error));
  },
);

export default http;
