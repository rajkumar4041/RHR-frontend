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
import { useState } from 'react';
import { useCreateAsset, useUpdateAsset } from './assetApi';
import type { Asset, CreateAssetPayload, UpdateAssetPayload } from '@/types/asset';
import { errorMessage } from '@/lib/axios';

interface Props {
  open: boolean;
  asset: Asset | null;
  onClose: () => void;
}

const schema = Yup.object({
  assetCode: Yup.string().trim().required('Required').max(40),
  name: Yup.string().trim().required('Required').max(150),
  category: Yup.string().max(100),
  serialNo: Yup.string().max(100),
});

export function AssetFormDialog({ open, asset, onClose }: Props) {
  const editing = Boolean(asset);
  const create = useCreateAsset();
  const update = useUpdateAsset(asset?.id ?? '');
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      assetCode: asset?.assetCode ?? '',
      name: asset?.name ?? '',
      category: asset?.category ?? '',
      serialNo: asset?.serialNo ?? '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setServerError(null);
      try {
        if (editing) {
          const payload: UpdateAssetPayload = {
            name: values.name.trim(),
            category: values.category.trim() || null,
            serialNo: values.serialNo.trim() || null,
          };
          await update.mutateAsync(payload);
        } else {
          const payload: CreateAssetPayload = {
            assetCode: values.assetCode.trim(),
            name: values.name.trim(),
            category: values.category.trim() || null,
            serialNo: values.serialNo.trim() || null,
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
        <DialogTitle>{editing ? 'Edit asset' : 'Add asset'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <TextField label="Asset code" {...text('assetCode')} disabled={editing} />
            <TextField label="Name" {...text('name')} />
            <Stack direction="row" spacing={2}>
              <TextField label="Category" {...text('category')} />
              <TextField label="Serial no." {...text('serialNo')} />
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
