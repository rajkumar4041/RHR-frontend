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
import { useCreateGoal, useUpdateGoal } from './performanceApi';
import type { Goal, GoalCreatePayload, GoalUpdatePayload } from '@/types/performance';
import { useEmployees } from '@/features/employees/employeeApi';
import { errorMessage } from '@/lib/axios';

interface Props {
  open: boolean;
  goal: Goal | null;
  onClose: () => void;
}

const schema = Yup.object({
  employeeId: Yup.string().trim().required('Required'),
  title: Yup.string().trim().required('Required').max(200),
  description: Yup.string().max(2000),
  weight: Yup.number()
    .typeError('Must be a number')
    .required('Required')
    .min(0, 'Must be 0 or more')
    .max(100, 'Must be 100 or less'),
  dueDate: Yup.string().nullable(),
});

export function GoalFormDialog({ open, goal, onClose }: Props) {
  const editing = Boolean(goal);
  const create = useCreateGoal();
  const update = useUpdateGoal(goal?.id ?? '');
  const { data: employees } = useEmployees({ page: 0, size: 100 });
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      employeeId: goal?.employeeId ?? '',
      title: goal?.title ?? '',
      description: goal?.description ?? '',
      weight: goal?.weight ?? 0,
      dueDate: goal?.dueDate ?? '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setServerError(null);
      try {
        if (editing) {
          const payload: GoalUpdatePayload = {
            title: values.title.trim(),
            description: values.description.trim() || null,
            weight: Number(values.weight),
            dueDate: values.dueDate || null,
          };
          await update.mutateAsync(payload);
        } else {
          const payload: GoalCreatePayload = {
            employeeId: values.employeeId,
            title: values.title.trim(),
            description: values.description.trim() || null,
            weight: Number(values.weight),
            dueDate: values.dueDate || null,
          };
          await create.mutateAsync(payload);
        }
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
        <DialogTitle>{editing ? 'Edit goal' : 'Add goal'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <TextField select label="Employee" {...text('employeeId')} disabled={editing}>
              <MenuItem value="">—</MenuItem>
              {(employees?.content ?? []).map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.employeeCode})
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Title" {...text('title')} />
            <TextField label="Description" multiline minRows={3} {...text('description')} />
            <Stack direction="row" spacing={2}>
              <TextField label="Weight" type="number" {...text('weight')} />
              <TextField
                label="Due date"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...text('dueDate')}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
