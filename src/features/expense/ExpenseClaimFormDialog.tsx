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
import { useCreateExpenseClaim, useExpenseCategories } from './expenseApi';
import { useEmployees } from '@/features/employees/employeeApi';
import type { ExpenseClaimPayload } from '@/types/expense';
import { errorMessage } from '@/lib/axios';

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = Yup.object({
  employeeId: Yup.string().required('Required'),
  categoryId: Yup.string(),
  amount: Yup.number().typeError('Enter a number').positive('Must be positive').required('Required'),
  currency: Yup.string().trim().required('Required').max(3),
  description: Yup.string().max(500),
});

export function ExpenseClaimFormDialog({ open, onClose }: Props) {
  const create = useCreateExpenseClaim();
  const { data: employees } = useEmployees({ page: 0, size: 100 });
  const { data: categories } = useExpenseCategories();
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      employeeId: '',
      categoryId: '',
      amount: '',
      currency: 'INR',
      description: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setServerError(null);
      const payload: ExpenseClaimPayload = {
        employeeId: values.employeeId,
        categoryId: values.categoryId || null,
        amount: Number(values.amount),
        currency: values.currency.trim().toUpperCase(),
        description: values.description.trim() || null,
      };
      try {
        await create.mutateAsync(payload);
        formik.resetForm();
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

  const handleClose = () => {
    formik.resetForm();
    setServerError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>New claim</DialogTitle>
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
            <TextField select label="Category" {...text('categoryId')}>
              <MenuItem value="">—</MenuItem>
              {(categories ?? []).map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField label="Amount" type="number" {...text('amount')} />
              <TextField label="Currency" {...text('currency')} />
            </Stack>
            <TextField label="Description" multiline minRows={2} {...text('description')} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Saving…' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
