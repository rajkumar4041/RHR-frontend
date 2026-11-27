import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useGeneratePayslip } from './payrollApi';
import { useEmployees } from '@/features/employees/employeeApi';
import type { GeneratePayslipPayload } from '@/types/payroll';
import { errorMessage } from '@/lib/axios';

interface Props {
  open: boolean;
  onClose: () => void;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

const schema = Yup.object({
  employeeId: Yup.string().required('Required'),
  month: Yup.number().min(1).max(12).required('Required'),
  year: Yup.number().required('Required'),
});

export function GeneratePayslipDialog({ open, onClose }: Props) {
  const generate = useGeneratePayslip();
  const { data: employees } = useEmployees({ page: 0, size: 100 });
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      employeeId: '',
      month: new Date().getMonth() + 1,
      year: CURRENT_YEAR,
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      setServerError(null);
      const payload: GeneratePayslipPayload = {
        employeeId: values.employeeId,
        month: Number(values.month),
        year: Number(values.year),
      };
      try {
        await generate.mutateAsync(payload);
        helpers.resetForm();
        onClose();
      } catch (err) {
        setServerError(errorMessage(err, 'Generation failed'));
      }
    },
  });

  const field = (name: keyof typeof formik.values) => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: Boolean(formik.touched[name] && formik.errors[name]),
    helperText: (formik.touched[name] && formik.errors[name]) as string | undefined,
    fullWidth: true,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>Generate payslip</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <TextField select label="Employee" {...field('employeeId')}>
              <MenuItem value="">—</MenuItem>
              {(employees?.content ?? []).map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.employeeCode})
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField select label="Month" {...field('month')}>
                {MONTHS.map((m, i) => (
                  <MenuItem key={m} value={i + 1}>
                    {m}
                  </MenuItem>
                ))}
              </TextField>
              <TextField select label="Year" {...field('year')}>
                {YEARS.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Generating…' : 'Generate'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
