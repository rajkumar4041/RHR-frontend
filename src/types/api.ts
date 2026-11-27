// Mirrors the backend's uniform response envelope and identity DTOs.

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: ApiFieldError[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

export interface RegisterCompanyResponse {
  tenantId: string;
  companySlug: string;
  adminUserId: string;
  tokens: TokenResponse;
}

export interface CurrentUser {
  userId: string;
  tenantId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  platformAdmin: boolean;
  roles: string[];
}

export interface LoginPayload {
  companySlug?: string;
  email: string;
  password: string;
}

export interface RegisterCompanyPayload {
  companyName: string;
  adminEmail: string;
  password: string;
  adminFirstName: string;
  adminLastName: string;
}
