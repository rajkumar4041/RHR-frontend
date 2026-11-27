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
import { useCreateTicket } from './helpdeskApi';
import { TICKET_PRIORITIES, type TicketPayload } from '@/types/helpdesk';
import { errorMessage } from '@/lib/axios';

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = Yup.object({
  subject: Yup.string().trim().required('Required').max(200),
  description: Yup.string().max(2000),
  category: Yup.string().max(100),
  priority: Yup.string().oneOf(TICKET_PRIORITIES).required('Required'),
});

export function TicketFormDialog({ open, onClose }: Props) {
  const create = useCreateTicket();
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      subject: '',
      description: '',
      category: '',
      priority: 'MEDIUM' as TicketPayload['priority'],
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      setServerError(null);
      const payload: TicketPayload = {
        subject: values.subject.trim(),
        description: values.description.trim() || null,
        category: values.category.trim() || null,
        priority: values.priority,
      };
      try {
        await create.mutateAsync(payload);
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
        <DialogTitle>Raise ticket</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <TextField label="Subject" {...text('subject')} />
            <TextField
              label="Description"
              multiline
              minRows={3}
              {...text('description')}
            />
            <Stack direction="row" spacing={2}>
              <TextField label="Category" {...text('category')} />
              <TextField select label="Priority" {...text('priority')}>
                {TICKET_PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
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
            {formik.isSubmitting ? 'Saving…' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
