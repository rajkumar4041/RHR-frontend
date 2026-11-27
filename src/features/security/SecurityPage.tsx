import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { authKeys, useDisableMfa, useEnableMfa, useMfaSetup } from '@/features/auth/authApi';
import { useAuthStore } from '@/stores/authStore';
import { errorMessage } from '@/lib/axios';
import type { MfaSetup } from '@/types/api';

export function SecurityPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setup = useMfaSetup();
  const enable = useEnableMfa();
  const disable = useDisableMfa();

  const [pending, setPending] = useState<MfaSetup | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refreshUser = () => qc.invalidateQueries({ queryKey: authKeys.me });

  const startSetup = async () => {
    setError(null);
    setNotice(null);
    try {
      setPending(await setup.mutateAsync());
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const confirmEnable = async () => {
    setError(null);
    try {
      await enable.mutateAsync(code.trim());
      setPending(null);
      setCode('');
      setNotice('Two-factor authentication is now enabled.');
      refreshUser();
    } catch (err) {
      setError(errorMessage(err, 'Invalid code'));
    }
  };

  const turnOff = async () => {
    setError(null);
    try {
      await disable.mutateAsync();
      setNotice('Two-factor authentication disabled.');
      refreshUser();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Box>
        <Typography variant="h4">Security</Typography>
        <Typography color="text.secondary">Manage two-factor authentication</Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="h6">Two-factor authentication (TOTP)</Typography>
            <Chip
              size="small"
              label={user?.mfaEnabled ? 'Enabled' : 'Disabled'}
              color={user?.mfaEnabled ? 'success' : 'default'}
              variant="outlined"
            />
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
          {notice && <Alert severity="success">{notice}</Alert>}

          {user?.mfaEnabled ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Your account is protected with an authenticator app. You can turn this off below.
              </Typography>
              <Box>
                <Button color="error" variant="outlined" disabled={disable.isPending} onClick={turnOff}>
                  Disable 2FA
                </Button>
              </Box>
            </>
          ) : pending ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Add this account to your authenticator app (Google Authenticator, Authy, 1Password…),
                then enter the current 6-digit code to finish.
              </Typography>
              <TextField
                label="Secret key"
                value={pending.secret}
                InputProps={{ readOnly: true }}
                helperText="Enter this key manually, or scan the otpauth URI below as a QR code"
                fullWidth
              />
              <TextField
                label="otpauth URI"
                value={pending.otpAuthUri}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                />
                <Button variant="contained" disabled={enable.isPending || code.length < 6} onClick={confirmEnable}>
                  {enable.isPending ? 'Enabling…' : 'Enable'}
                </Button>
                <Button color="inherit" onClick={() => setPending(null)}>
                  Cancel
                </Button>
              </Stack>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                Add an extra layer of security — you'll enter a code from your authenticator app at sign-in.
              </Typography>
              <Box>
                <Button variant="contained" disabled={setup.isPending} onClick={startSetup}>
                  {setup.isPending ? 'Preparing…' : 'Set up 2FA'}
                </Button>
              </Box>
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
