import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useCancelSubscription, useInvoices, useSubscription } from './billingApi';
import { ChangePlanDialog } from './ChangePlanDialog';
import { GenerateInvoiceDialog } from './GenerateInvoiceDialog';
import { InvoiceDetailDialog } from './InvoiceDetailDialog';
import { INVOICE_STATUSES, type InvoiceStatus } from '@/types/billing';
import { useHasAnyRole } from '@/features/auth/useRoles';

const STATUS_COLOR: Record<InvoiceStatus, 'default' | 'warning' | 'success' | 'error'> = {
  DRAFT: 'default',
  ISSUED: 'warning',
  PAID: 'success',
  OVERDUE: 'error',
  VOID: 'default',
};

export function BillingPage() {
  const canManage = useHasAnyRole()('COMPANY_ADMIN', 'FINANCE_MANAGER');
  const { data: sub, isLoading: subLoading } = useSubscription();
  const cancel = useCancelSubscription();

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState('');
  const [changeOpen, setChangeOpen] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useInvoices(page, size, status || undefined);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Billing</Typography>
        <Typography color="text.secondary">Subscription and invoices</Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 3 }}>
        {subLoading ? (
          <CircularProgress size={24} />
        ) : sub ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Current plan
              </Typography>
              <Typography variant="h5">{sub.planName}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                <Chip size="small" label={sub.status} color="primary" variant="outlined" />
                <Chip size="small" label={sub.billingCycle} variant="outlined" />
                {sub.cancelAtPeriodEnd && (
                  <Chip size="small" label="Cancels at period end" color="warning" variant="outlined" />
                )}
              </Stack>
              {sub.currentPeriodEnd && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Renews / ends: {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </Typography>
              )}
            </Box>
            {canManage && (
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Button variant="outlined" onClick={() => setChangeOpen(true)}>
                  Change plan
                </Button>
                <Button
                  color="error"
                  disabled={sub.cancelAtPeriodEnd || cancel.isPending}
                  onClick={() => cancel.mutate()}
                >
                  Cancel
                </Button>
              </Stack>
            )}
          </Stack>
        ) : (
          <Typography color="text.secondary">No subscription found.</Typography>
        )}
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ p: 2 }}>
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {INVOICE_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          {canManage && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setGenOpen(true)}>
              Generate invoice
            </Button>
          )}
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
              Failed to load invoices.
            </Alert>
          </Box>
        ) : !data || data.content.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6">No invoices yet</Typography>
            <Typography color="text.secondary">Generate your first invoice.</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Paid</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.content.map((inv) => (
                    <TableRow key={inv.id} hover sx={{ cursor: 'pointer' }} onClick={() => setDetailId(inv.id)}>
                      <TableCell>{inv.invoiceNumber}</TableCell>
                      <TableCell>
                        {inv.periodStart} → {inv.periodEnd}
                      </TableCell>
                      <TableCell align="right">
                        {inv.currency} {inv.total}
                      </TableCell>
                      <TableCell align="right">{inv.amountPaid}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={inv.status}
                          color={STATUS_COLOR[inv.status]}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={data.totalElements}
              page={page}
              rowsPerPage={size}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </>
        )}
      </Paper>

      <ChangePlanDialog open={changeOpen} onClose={() => setChangeOpen(false)} />
      <GenerateInvoiceDialog open={genOpen} onClose={() => setGenOpen(false)} />
      <InvoiceDetailDialog invoiceId={detailId} canManage={canManage} onClose={() => setDetailId(null)} />
    </Stack>
  );
}
