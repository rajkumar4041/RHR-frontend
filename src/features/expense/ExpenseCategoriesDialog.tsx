import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCreateExpenseCategory, useExpenseCategories } from './expenseApi';
import type { ExpenseCategoryPayload } from '@/types/expense';
import { errorMessage } from '@/lib/axios';

interface Props {
  open: boolean;
  canWrite: boolean;
  onClose: () => void;
}

const schema = Yup.object({
  name: Yup.string().trim().required('Required').max(100),
  code: Yup.string().trim().required('Required').max(40),
});

export function ExpenseCategoriesDialog({ open, canWrite, onClose }: Props) {
  const { data, isLoading, isError, refetch } = useExpenseCategories();
  const create = useCreateExpenseCategory();
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: { name: '', code: '' },
    validationSchema: schema,
    onSubmit: async (values) => {
      setServerError(null);
      const payload: ExpenseCategoryPayload = {
        name: values.name.trim(),
        code: values.code.trim(),
      };
      try {
        await create.mutateAsync(payload);
        formik.resetForm();
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
      <DialogTitle>Categories</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
              Failed to load categories.
            </Alert>
          ) : !data || data.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No categories yet.
            </Typography>
          ) : (
            <List dense>
              {data.map((c) => (
                <ListItem key={c.id} disableGutters>
                  <ListItemText primary={c.name} secondary={c.code} />
                </ListItem>
              ))}
            </List>
          )}

          {canWrite && (
            <>
              <Divider />
              <form onSubmit={formik.handleSubmit} noValidate>
                <Stack spacing={2}>
                  {serverError && <Alert severity="error">{serverError}</Alert>}
                  <Stack direction="row" spacing={2}>
                    <TextField label="Name" {...text('name')} />
                    <TextField label="Code" {...text('code')} />
                  </Stack>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="outlined" disabled={formik.isSubmitting}>
                      {formik.isSubmitting ? 'Adding…' : 'Add category'}
                    </Button>
                  </Box>
                </Stack>
              </form>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
