import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useLogin, useVerifyMfa } from './authApi';
import { errorMessage } from '@/lib/axios';
import { AuthShell } from './AuthShell';

const schema = Yup.object({
  companySlug: Yup.string().trim().max(80, 'Too long'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const verifyMfa = useVerifyMfa();
  const [serverError, setServerError] = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  const formik = useFormik({
    initialValues: { companySlug: '', email: '', password: '' },
    validationSchema: schema,
    onSubmit: async (values) => {
      setServerError(null);
      try {
        const result = await login.mutateAsync({
          companySlug: values.companySlug.trim() || undefined,
          email: values.email.trim(),
          password: values.password,
        });
        if (result.mfaRequired && result.mfaToken) {
          setMfaToken(result.mfaToken);
        } else {
          navigate('/');
        }
      } catch (err) {
        setServerError(errorMessage(err, 'Login failed'));
      }
    },
  });

  const submitMfa = async () => {
    if (!mfaToken) return;
    setServerError(null);
    try {
      await verifyMfa.mutateAsync({ mfaToken, code: mfaCode.trim() });
      navigate('/');
    } catch (err) {
      setServerError(errorMessage(err, 'Verification failed'));
    }
  };

  if (mfaToken) {
    return (
      <AuthShell title="Two-factor authentication" subtitle="Enter the 6-digit code from your authenticator app">
        <Box component="form" onSubmit={(e) => { e.preventDefault(); void submitMfa(); }} noValidate>
          <Stack spacing={2.5}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <TextField
              label="Authentication code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              inputProps={{ inputMode: 'numeric', maxLength: 6 }}
              autoFocus
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" disabled={verifyMfa.isPending || mfaCode.length < 6}>
              {verifyMfa.isPending ? 'Verifying…' : 'Verify'}
            </Button>
            <Button color="inherit" onClick={() => { setMfaToken(null); setMfaCode(''); }}>
              Back to login
            </Button>
          </Stack>
        </Box>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your RHR workspace">
      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <Stack spacing={2.5}>
          {serverError && <Alert severity="error">{serverError}</Alert>}
          <TextField
            label="Company"
            name="companySlug"
            placeholder="your-company"
            fullWidth
            value={formik.values.companySlug}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.companySlug && formik.errors.companySlug)}
            helperText={
              (formik.touched.companySlug && formik.errors.companySlug) ||
              'Leave blank for platform admin'
            }
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.email && formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.password && formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            New company?{' '}
            <Link component={RouterLink} to="/register" fontWeight={600}>
              Create a workspace
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthShell>
  );
}
