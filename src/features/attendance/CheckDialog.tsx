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
import { useCheckIn, useCheckOut } from './attendanceApi';
import { useEmployees } from '@/features/employees/employeeApi';
import type { AttendanceCheckPayload } from '@/types/attendance';
import { errorMessage } from '@/lib/axios';

type Mode = 'check-in' | 'check-out';

interface Props {
  open: boolean;
  mode: Mode;
  onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const schema = Yup.object({
  employeeId: Yup.string().required('Required'),
  workDate: Yup.string().required('Required'),
});

export function CheckDialog({ open, mode, onClose }: Props) {
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const { data: employees } = useEmployees({ page: 0, size: 100 });
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      employeeId: '',
      workDate: today(),
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setServerError(null);
      const payload: AttendanceCheckPayload = {
        employeeId: values.employeeId,
        workDate: values.workDate,
      };
      try {
        if (mode === 'check-in') {
          await checkIn.mutateAsync(payload);
        } else {
          await checkOut.mutateAsync(payload);
        }
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
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>{mode === 'check-in' ? 'Check in' : 'Check out'}</DialogTitle>
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
            <TextField
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...text('workDate')}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Saving…' : mode === 'check-in' ? 'Check in' : 'Check out'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
