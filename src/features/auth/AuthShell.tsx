import type { ReactNode } from 'react';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Centered card layout shared by the login and registration screens. */
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #eef2ff 0%, #f6f7fb 55%, #e0f2fe 100%)',
      }}
    >
      <Container maxWidth="xs">
        <Stack spacing={1} alignItems="center" mb={3}>
          <Typography variant="h4" color="primary.dark" fontWeight={800}>
            RHR
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Human Resource Management
          </Typography>
        </Stack>
        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={0.5} mb={3}>
            <Typography variant="h5">{title}</Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Stack>
          {children}
        </Paper>
      </Container>
    </Box>
  );
}
