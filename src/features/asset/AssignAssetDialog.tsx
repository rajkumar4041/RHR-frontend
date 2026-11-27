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
import { useState } from 'react';
import { useAssignAsset } from './assetApi';
import type { Asset, AssignAssetPayload } from '@/types/asset';
import { errorMessage } from '@/lib/axios';
import { useEmployees } from '@/features/employees/employeeApi';

interface Props {
  open: boolean;
  asset: Asset | null;
  onClose: () => void;
}

const schema = Yup.object({
  employeeId: Yup.string().required('Required'),
  notes: Yup.string().max(500),
});

export function AssignAssetDialog({ open, asset, onClose }: Props) {
  const assign = useAssignAsset(asset?.id ?? '');
  const { data: employees } = useEmployees({ page: 0, size: 100 });
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      employeeId: '',
      notes: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setServerError(null);
      const payload: AssignAssetPayload = {
        employeeId: values.employeeId,
        notes: values.notes.trim() || null,
      };
      try {
        await assign.mutateAsync(payload);
        onClose();
      } catch (err) {
        setServerError(errorMessage(err, 'Assign failed'));
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
        <DialogTitle>Assign {asset?.name ?? 'asset'}</DialogTitle>
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
            <TextField label="Notes" multiline minRows={2} {...text('notes')} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Assigning…' : 'Assign'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
