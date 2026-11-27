import { useMutation, useQuery } from '@tanstack/react-query';
import { http, unwrap } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import type {
  ApiResponse,
  CurrentUser,
  LoginPayload,
  LoginResult,
  MfaSetup,
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

async function login(payload: LoginPayload): Promise<LoginResult> {
  return unwrap(await http.post<ApiResponse<LoginResult>>('/auth/login', payload));
}

async function registerCompany(payload: RegisterCompanyPayload): Promise<RegisterCompanyResponse> {
  return unwrap(
    await http.post<ApiResponse<RegisterCompanyResponse>>('/auth/register-company', payload),
  );
}

/**
 * Logs in. If MFA is required, returns `{ mfaRequired: true, mfaToken }` and the
 * caller shows the code step. Otherwise stores tokens, loads the user, and
 * returns `{ mfaRequired: false }`.
 */
export function useLogin() {
  const { setTokens, setUser } = useAuthStore();
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const result = await login(payload);
      if (result.mfaRequired || !result.tokens) {
        return { mfaRequired: true, mfaToken: result.mfaToken };
      }
      setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      setUser(await fetchCurrentUser());
      return { mfaRequired: false, mfaToken: null };
    },
  });
}

/** Completes an MFA login with the challenge token + 6-digit code. */
export function useVerifyMfa() {
  const { setTokens, setUser } = useAuthStore();
  return useMutation({
    mutationFn: async ({ mfaToken, code }: { mfaToken: string; code: string }) => {
      const tokens = unwrap(
        await http.post<ApiResponse<TokenResponse>>('/auth/mfa/verify', { mfaToken, code }),
      );
      setTokens(tokens.accessToken, tokens.refreshToken);
      setUser(await fetchCurrentUser());
    },
  });
}

/** MFA enrolment management (authenticated user). */
export function useMfaSetup() {
  return useMutation({
    mutationFn: async () => unwrap(await http.post<ApiResponse<MfaSetup>>('/auth/mfa/setup', {})),
  });
}

export function useEnableMfa() {
  return useMutation({
    mutationFn: async (code: string) =>
      unwrap(await http.post<ApiResponse<{ enabled: boolean }>>('/auth/mfa/enable', { code })),
  });
}

export function useDisableMfa() {
  return useMutation({
    mutationFn: async () =>
      unwrap(await http.post<ApiResponse<{ enabled: boolean }>>('/auth/mfa/disable', {})),
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
