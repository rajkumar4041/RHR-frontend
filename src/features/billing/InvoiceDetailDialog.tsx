import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useInvoiceAction, useInvoiceDetail } from './billingApi';
import { errorMessage } from '@/lib/axios';
import type { InvoiceStatus } from '@/types/billing';

const STATUS_COLOR: Record<InvoiceStatus, 'default' | 'warning' | 'success' | 'error'> = {
  DRAFT: 'default',
  ISSUED: 'warning',
  PAID: 'success',
  OVERDUE: 'error',
  VOID: 'default',
};

export function InvoiceDetailDialog({
  invoiceId,
  canManage,
  onClose,
}: {
  invoiceId: string | null;
  canManage: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = useInvoiceDetail(invoiceId);
  const action = useInvoiceAction();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BANK_TRANSFER');
  const [error, setError] = useState<string | null>(null);

  const inv = data?.invoice;
  const open = Boolean(invoiceId);

  const run = async (act: 'issue' | 'void' | 'record-payment', body?: unknown) => {
    if (!invoiceId) return;
    setError(null);
    try {
      await action.mutateAsync({ id: invoiceId, action: act, body });
      if (act === 'record-payment') setAmount('');
    } catch (err) {
      setError(errorMessage(err, 'Action failed'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {inv ? inv.invoiceNumber : 'Invoice'}
        {inv && (
          <Chip
            size="small"
            sx={{ ml: 1 }}
            label={inv.status}
            color={STATUS_COLOR[inv.status]}
            variant="outlined"
          />
        )}
      </DialogTitle>
      <DialogContent>
        {isLoading || !data || !inv ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : (
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Period
              </Typography>
              <Typography variant="body2">
                {inv.periodStart} → {inv.periodEnd}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <Typography variant="body2">
                {inv.currency} {inv.subtotal}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tax ({inv.taxPercent}%)
              </Typography>
              <Typography variant="body2">
                {inv.currency} {inv.taxAmount}
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {inv.currency} {inv.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paid
              </Typography>
              <Typography variant="body2">
                {inv.currency} {inv.amountPaid}
              </Typography>
            </Box>

            <Divider />
            <Typography variant="subtitle2">Line items</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.lineItems.map((li) => (
                  <TableRow key={li.id}>
                    <TableCell>{li.description}</TableCell>
                    <TableCell align="right">{li.quantity}</TableCell>
                    <TableCell align="right">{li.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {data.payments.length > 0 && (
              <>
                <Typography variant="subtitle2">Payments</Typography>
                <Table size="small">
                  <TableBody>
                    {data.payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.method}</TableCell>
                        <TableCell>{p.reference ?? '—'}</TableCell>
                        <TableCell align="right">{p.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}

            {canManage && inv.status !== 'VOID' && inv.status !== 'PAID' && (
              <>
                <Divider />
                <Stack direction="row" spacing={1}>
                  {inv.status === 'DRAFT' && (
                    <Button size="small" variant="outlined" onClick={() => run('issue')}>
                      Issue
                    </Button>
                  )}
                  <Button size="small" color="error" onClick={() => run('void')}>
                    Void
                  </Button>
                </Stack>
                <Typography variant="subtitle2">Record payment</Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    label="Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <TextField
                    size="small"
                    select
                    label="Method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    sx={{ minWidth: 150 }}
                  >
                    {['BANK_TRANSFER', 'CASH', 'CARD', 'UPI', 'MANUAL', 'OTHER'].map((m) => (
                      <MenuItem key={m} value={m}>
                        {m.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="contained"
                    disabled={!amount || action.isPending}
                    onClick={() => run('record-payment', { amount: Number(amount), method })}
                  >
                    Add
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
