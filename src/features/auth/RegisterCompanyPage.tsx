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
import { useRegisterCompany } from './authApi';
import { errorMessage } from '@/lib/axios';
import { AuthShell } from './AuthShell';

const schema = Yup.object({
  companyName: Yup.string().trim().required('Company name is required').max(200),
  adminFirstName: Yup.string().trim().required('First name is required').max(100),
  adminLastName: Yup.string().trim().required('Last name is required').max(100),
  adminEmail: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'At least 8 characters')
    .max(72)
    .required('Password is required'),
});

export function RegisterCompanyPage() {
  const navigate = useNavigate();
  const register = useRegisterCompany();
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      companyName: '',
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      password: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setServerError(null);
      try {
        await register.mutateAsync({
          companyName: values.companyName.trim(),
          adminFirstName: values.adminFirstName.trim(),
          adminLastName: values.adminLastName.trim(),
          adminEmail: values.adminEmail.trim(),
          password: values.password,
        });
        navigate('/');
      } catch (err) {
        setServerError(errorMessage(err, 'Registration failed'));
      }
    },
  });

  const field = (name: keyof typeof formik.values) => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: Boolean(formik.touched[name] && formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
    fullWidth: true,
  });

  return (
    <AuthShell title="Create your workspace" subtitle="Start a 14-day free trial">
      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <Stack spacing={2.5}>
          {serverError && <Alert severity="error">{serverError}</Alert>}
          <TextField label="Company name" {...field('companyName')} />
          <Stack direction="row" spacing={2}>
            <TextField label="First name" {...field('adminFirstName')} />
            <TextField label="Last name" {...field('adminLastName')} />
          </Stack>
          <TextField label="Work email" type="email" {...field('adminEmail')} />
          <TextField label="Password" type="password" {...field('password')} />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Creating…' : 'Create workspace'}
          </Button>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" fontWeight={600}>
              Sign in
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthShell>
  );
}
