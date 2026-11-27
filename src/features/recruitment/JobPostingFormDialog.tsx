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
  Stack,
  TextField,
} from '@mui/material';
import { useCreateJobPosting } from './recruitmentApi';
import type { JobPostingPayload } from '@/types/recruitment';
import { errorMessage } from '@/lib/axios';

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = Yup.object({
  title: Yup.string().trim().required('Required').max(200),
  description: Yup.string().max(2000),
  openings: Yup.number().typeError('Must be a number').integer().min(1, 'At least 1').required('Required'),
});

export function JobPostingFormDialog({ open, onClose }: Props) {
  const create = useCreateJobPosting();
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: '',
      description: '',
      openings: 1,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setServerError(null);
      const payload: JobPostingPayload = {
        title: values.title.trim(),
        description: values.description.trim() || null,
        openings: Number(values.openings),
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>Post a job</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <TextField label="Title" {...text('title')} />
            <TextField label="Description" multiline minRows={3} {...text('description')} />
            <TextField label="Openings" type="number" inputProps={{ min: 1 }} {...text('openings')} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Saving…' : 'Post job'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
