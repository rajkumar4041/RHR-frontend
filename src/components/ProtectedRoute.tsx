import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '@/stores/authStore';
import { useCurrentUser } from '@/features/auth/authApi';

/**
 * Gates the authenticated app. Client-side route protection is UX only — the
 * backend enforces authorization on every request.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const hasToken = useAuthStore((s) => Boolean(s.accessToken));
  const { isLoading, isError } = useCurrentUser();

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
