import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse, TokenResponse } from '@/types/api';

const baseURL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api`;

export const http: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the access token to every request.
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- 401 handling with single-flight refresh-token rotation ----------------
let refreshing: Promise<string> | null = null;

async function rotateRefreshToken(): Promise<string> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }
  // Bare axios (not `http`) so this request skips the interceptors.
  const { data } = await axios.post<ApiResponse<TokenResponse>>(
    `${baseURL}/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  );
  if (!data.success || !data.data) {
    throw new Error(data.error?.message ?? 'Refresh failed');
  }
  const tokens = data.data;
  useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);
  return tokens.accessToken;
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;
    const isRefreshCall = original?.url?.includes('/auth/refresh');

    if (status === 401 && original && !original._retried && !isRefreshCall) {
      original._retried = true;
      try {
        refreshing = refreshing ?? rotateRefreshToken();
        const newToken = await refreshing;
        refreshing = null;
        original.headers.Authorization = `Bearer ${newToken}`;
        return http(original);
      } catch (refreshError) {
        refreshing = null;
        useAuthStore.getState().clear();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.assign('/login');
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

/** Unwraps the API envelope, throwing a readable Error on failure. */
export function unwrap<T>(response: { data: ApiResponse<T> }): T {
  const body = response.data;
  if (!body.success || body.data === undefined) {
    throw new Error(body.error?.message ?? 'Request failed');
  }
  return body.data;
}

/** Extracts a user-facing message from any thrown request error. */
export function errorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as ApiResponse<unknown> | undefined;
    return body?.error?.message ?? err.message ?? fallback;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}
