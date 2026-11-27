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
import { useApplyLeave, useLeaveTypes } from './leaveApi';
import { useEmployees } from '@/features/employees/employeeApi';
import { errorMessage } from '@/lib/axios';

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = Yup.object({
  employeeId: Yup.string().required('Select an employee'),
  leaveTypeId: Yup.string().required('Select a leave type'),
  startDate: Yup.string().required('Required'),
  endDate: Yup.string()
    .required('Required')
    .test('after', 'End date must be on or after start date', function (value) {
      const { startDate } = this.parent;
      return !startDate || !value || value >= startDate;
    }),
  reason: Yup.string().max(500),
});

export function ApplyLeaveDialog({ open, onClose }: Props) {
  const apply = useApplyLeave();
  const { data: types } = useLeaveTypes();
  const { data: employees } = useEmployees({ page: 0, size: 100 });
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: { employeeId: '', leaveTypeId: '', startDate: '', endDate: '', reason: '' },
    validationSchema: schema,
    onSubmit: async (values) => {
      setServerError(null);
      try {
        await apply.mutateAsync({
          employeeId: values.employeeId,
          leaveTypeId: values.leaveTypeId,
          startDate: values.startDate,
          endDate: values.endDate,
          reason: values.reason.trim() || undefined,
        });
        formik.resetForm();
        onClose();
      } catch (err) {
        setServerError(errorMessage(err, 'Could not submit leave request'));
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
        <DialogTitle>Apply for leave</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <TextField select label="Employee" {...text('employeeId')}>
              {(employees?.content ?? []).map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.employeeCode})
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Leave type" {...text('leaveTypeId')}>
              {(types ?? []).map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Start date"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...text('startDate')}
              />
              <TextField
                label="End date"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...text('endDate')}
              />
            </Stack>
            <TextField label="Reason" multiline minRows={2} {...text('reason')} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Submitting…' : 'Submit request'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
