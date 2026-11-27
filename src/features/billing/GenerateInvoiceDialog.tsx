import { useState } from 'react';
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
import { useGenerateInvoice } from './billingApi';
import { errorMessage } from '@/lib/axios';

export function GenerateInvoiceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const generate = useGenerateInvoice();
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [taxPercent, setTaxPercent] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await generate.mutateAsync({
        periodStart,
        periodEnd,
        taxPercent: Number(taxPercent) || 0,
        dueDate: dueDate || undefined,
      });
      onClose();
    } catch (err) {
      setError(errorMessage(err, 'Could not generate invoice'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Generate invoice</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Period start"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            fullWidth
          />
          <TextField
            label="Period end"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            fullWidth
          />
          <TextField
            label="Tax %"
            type="number"
            value={taxPercent}
            onChange={(e) => setTaxPercent(e.target.value)}
            fullWidth
          />
          <TextField
            label="Due date (optional)"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          disabled={!periodStart || !periodEnd || generate.isPending}
        >
          {generate.isPending ? 'Generating…' : 'Generate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
