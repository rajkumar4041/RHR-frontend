import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useCreateLeaveType, useLeaveTypes } from './leaveApi';
import { errorMessage } from '@/lib/axios';

const schema = Yup.object({
  name: Yup.string().trim().required('Required').max(100),
  code: Yup.string().trim().required('Required').max(40),
  daysPerYear: Yup.number().min(0, 'Must be ≥ 0').required('Required'),
});

export function LeaveTypesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: types } = useLeaveTypes();
  const create = useCreateLeaveType();
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: { name: '', code: '', daysPerYear: 0, paid: true, carryForward: false },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      setServerError(null);
      try {
        await create.mutateAsync({ ...values, daysPerYear: Number(values.daysPerYear) });
        helpers.resetForm();
      } catch (err) {
        setServerError(errorMessage(err, 'Could not create leave type'));
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Leave types</DialogTitle>
      <DialogContent>
        <List dense>
          {(types ?? []).map((t) => (
            <ListItem key={t.id} disableGutters>
              <ListItemText
                primary={`${t.name} (${t.code})`}
                secondary={`${t.daysPerYear} days/yr · ${t.paid ? 'Paid' : 'Unpaid'}${t.carryForward ? ' · Carry forward' : ''}`}
              />
            </ListItem>
          ))}
          {(!types || types.length === 0) && (
            <Typography variant="body2" color="text.secondary">
              No leave types yet.
            </Typography>
          )}
        </List>
        <Divider sx={{ my: 2 }} />
        <form onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={Boolean(formik.touched.name && formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                fullWidth
              />
              <TextField
                label="Code"
                name="code"
                value={formik.values.code}
                onChange={formik.handleChange}
                error={Boolean(formik.touched.code && formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
                fullWidth
              />
            </Stack>
            <TextField
              label="Days per year"
              name="daysPerYear"
              type="number"
              value={formik.values.daysPerYear}
              onChange={formik.handleChange}
              error={Boolean(formik.touched.daysPerYear && formik.errors.daysPerYear)}
              helperText={formik.touched.daysPerYear && formik.errors.daysPerYear}
            />
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    name="paid"
                    checked={formik.values.paid}
                    onChange={formik.handleChange}
                  />
                }
                label="Paid"
              />
              <FormControlLabel
                control={
                  <Switch
                    name="carryForward"
                    checked={formik.values.carryForward}
                    onChange={formik.handleChange}
                  />
                }
                label="Carry forward"
              />
            </Stack>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={onClose} color="inherit">
                Close
              </Button>
              <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
                Add type
              </Button>
            </Stack>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
