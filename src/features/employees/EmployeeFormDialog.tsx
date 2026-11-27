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
import { useCreateEmployee, useDepartments, useDesignations, useUpdateEmployee } from './employeeApi';
import { EMPLOYMENT_STATUSES, type Employee, type EmployeePayload } from '@/types/employee';
import { errorMessage } from '@/lib/axios';
import { useState } from 'react';

interface Props {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
}

const schema = Yup.object({
  employeeCode: Yup.string().trim().required('Required').max(40),
  firstName: Yup.string().trim().required('Required').max(100),
  lastName: Yup.string().trim().required('Required').max(100),
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.string().max(30),
  dateOfJoining: Yup.string().nullable(),
  employmentStatus: Yup.string().oneOf(EMPLOYMENT_STATUSES),
});

export function EmployeeFormDialog({ open, employee, onClose }: Props) {
  const editing = Boolean(employee);
  const create = useCreateEmployee();
  const update = useUpdateEmployee(employee?.id ?? '');
  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      employeeCode: employee?.employeeCode ?? '',
      firstName: employee?.firstName ?? '',
      lastName: employee?.lastName ?? '',
      email: employee?.email ?? '',
      phone: employee?.phone ?? '',
      departmentId: employee?.departmentId ?? '',
      designationId: employee?.designationId ?? '',
      dateOfJoining: employee?.dateOfJoining ?? '',
      employmentStatus: employee?.employmentStatus ?? 'ACTIVE',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setServerError(null);
      const payload: EmployeePayload = {
        employeeCode: values.employeeCode.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        departmentId: values.departmentId || null,
        designationId: values.designationId || null,
        dateOfJoining: values.dateOfJoining || null,
        employmentStatus: values.employmentStatus,
      };
      try {
        if (editing) {
          await update.mutateAsync(payload);
        } else {
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
        <DialogTitle>{editing ? 'Edit employee' : 'Add employee'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <Stack direction="row" spacing={2}>
              <TextField label="Employee code" {...text('employeeCode')} disabled={editing} />
              <TextField select label="Status" {...text('employmentStatus')}>
                {EMPLOYMENT_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s.replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="First name" {...text('firstName')} />
              <TextField label="Last name" {...text('lastName')} />
            </Stack>
            <TextField label="Email" type="email" {...text('email')} />
            <Stack direction="row" spacing={2}>
              <TextField label="Phone" {...text('phone')} />
              <TextField
                label="Date of joining"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...text('dateOfJoining')}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField select label="Department" {...text('departmentId')}>
                <MenuItem value="">—</MenuItem>
                {(departments ?? []).map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField select label="Designation" {...text('designationId')}>
                <MenuItem value="">—</MenuItem>
                {(designations ?? []).map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.title}
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
            {formik.isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
