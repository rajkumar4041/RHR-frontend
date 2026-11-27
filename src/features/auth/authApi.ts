import { useMutation, useQuery } from '@tanstack/react-query';
import { http, unwrap } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import type {
  ApiResponse,
  CurrentUser,
  LoginPayload,
  RegisterCompanyPayload,
  RegisterCompanyResponse,
  TokenResponse,
} from '@/types/api';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

async function fetchCurrentUser(): Promise<CurrentUser> {
  return unwrap(await http.get<ApiResponse<CurrentUser>>('/me'));
}

async function login(payload: LoginPayload): Promise<TokenResponse> {
  return unwrap(await http.post<ApiResponse<TokenResponse>>('/auth/login', payload));
}

async function registerCompany(payload: RegisterCompanyPayload): Promise<RegisterCompanyResponse> {
  return unwrap(
    await http.post<ApiResponse<RegisterCompanyResponse>>('/auth/register-company', payload),
  );
}

/** Logs in, stores tokens, then loads and stores the current user. */
export function useLogin() {
  const { setTokens, setUser } = useAuthStore();
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const tokens = await login(payload);
      setTokens(tokens.accessToken, tokens.refreshToken);
      const user = await fetchCurrentUser();
      setUser(user);
      return user;
    },
  });
}

/** Registers a company + admin, stores the returned tokens, loads the user. */
export function useRegisterCompany() {
  const { setTokens, setUser } = useAuthStore();
  return useMutation({
    mutationFn: async (payload: RegisterCompanyPayload) => {
      const result = await registerCompany(payload);
      setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      const user = await fetchCurrentUser();
      setUser(user);
      return user;
    },
  });
}

/** Reads the current user from the backend; enabled only when a token exists. */
export function useCurrentUser() {
  const hasToken = useAuthStore((s) => Boolean(s.accessToken));
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const user = await fetchCurrentUser();
      setUser(user);
      return user;
    },
    enabled: hasToken,
    staleTime: 60_000,
  });
}
