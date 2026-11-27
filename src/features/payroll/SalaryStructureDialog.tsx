import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useAssignSalaryStructure } from './payrollApi';
import { useEmployees } from '@/features/employees/employeeApi';
import type { SalaryStructurePayload } from '@/types/payroll';
import { errorMessage } from '@/lib/axios';

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = Yup.object({
  employeeId: Yup.string().required('Required'),
  basic: Yup.number().typeError('Enter a number').min(0, 'Must be ≥ 0').required('Required'),
  hra: Yup.number().typeError('Enter a number').min(0, 'Must be ≥ 0').required('Required'),
  allowances: Yup.number().typeError('Enter a number').min(0, 'Must be ≥ 0').required('Required'),
  deductions: Yup.number().typeError('Enter a number').min(0, 'Must be ≥ 0').required('Required'),
  effectiveFrom: Yup.string().required('Required'),
});

export function SalaryStructureDialog({ open, onClose }: Props) {
  const assign = useAssignSalaryStructure();
  const { data: employees } = useEmployees({ page: 0, size: 100 });
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      employeeId: '',
      basic: '',
      hra: '',
      allowances: '',
      deductions: '',
      effectiveFrom: '',
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      setServerError(null);
      const payload: SalaryStructurePayload = {
        employeeId: values.employeeId,
        basic: Number(values.basic),
        hra: Number(values.hra),
        allowances: Number(values.allowances),
        deductions: Number(values.deductions),
        effectiveFrom: values.effectiveFrom,
      };
      try {
        await assign.mutateAsync(payload);
        helpers.resetForm();
        onClose();
      } catch (err) {
        setServerError(errorMessage(err, 'Save failed'));
      }
    },
  });

  const text = (name: keyof typeof formik.values) => ({
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
        <DialogTitle>Assign salary structure</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <TextField select label="Employee" {...text('employeeId')}>
              <MenuItem value="">—</MenuItem>
              {(employees?.content ?? []).map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.employeeCode})
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)' }, gap: 2 }}>
              <TextField label="Basic" type="number" {...text('basic')} />
              <TextField label="HRA" type="number" {...text('hra')} />
              <TextField label="Allowances" type="number" {...text('allowances')} />
              <TextField label="Deductions" type="number" {...text('deductions')} />
            </Box>
            <TextField
              label="Effective from"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...text('effectiveFrom')}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Saving…' : 'Assign'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
