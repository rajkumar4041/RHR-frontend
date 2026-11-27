import { useMemo, useState } from 'react';
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
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import { useDecideExpenseClaim, useExpenseCategories, useExpenseClaims } from './expenseApi';
import { ExpenseClaimFormDialog } from './ExpenseClaimFormDialog';
import { ExpenseCategoriesDialog } from './ExpenseCategoriesDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useEmployees } from '@/features/employees/employeeApi';
import { useHasAnyRole } from '@/features/auth/useRoles';
import { EXPENSE_STATUSES, type ExpenseClaim, type ExpenseStatus } from '@/types/expense';

const STATUS_COLOR: Record<ExpenseStatus, 'success' | 'warning' | 'error' | 'info'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  REIMBURSED: 'info',
};

type PendingAction = {
  claim: ExpenseClaim;
  action: 'approve' | 'reject' | 'reimburse';
};

export function ExpensePage() {
  const hasAnyRole = useHasAnyRole();
  const canWrite = hasAnyRole('COMPANY_ADMIN', 'FINANCE_MANAGER');

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [claimOpen, setClaimOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const { data, isLoading, isError, refetch } = useExpenseClaims({
    page,
    size,
    status: status || undefined,
  });
  const { data: employees } = useEmployees({ page: 0, size: 100 });
  const { data: categories } = useExpenseCategories();
  const decide = useDecideExpenseClaim();

  const employeeName = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of employees?.content ?? []) {
      map.set(e.id, `${e.firstName} ${e.lastName}`);
    }
    return map;
  }, [employees]);

  const categoryName = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories ?? []) {
      map.set(c.id, c.name);
    }
    return map;
  }, [categories]);

  const actionLabel = pending
    ? pending.action.charAt(0).toUpperCase() + pending.action.slice(1)
    : '';

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4">Expenses</Typography>
          <Typography color="text.secondary">Review and reimburse expense claims</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<CategoryIcon />}
            onClick={() => setCategoriesOpen(true)}
          >
            Categories
          </Button>
          {canWrite && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setClaimOpen(true)}>
              New claim
            </Button>
          )}
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} sx={{ p: 2 }}>
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
            {EXPENSE_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
              Failed to load expense claims.
            </Alert>
          </Box>
        ) : !data || data.content.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6">No expense claims yet</Typography>
            <Typography color="text.secondary">
              {canWrite ? 'Create the first claim to get started.' : 'Nothing to show.'}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    {canWrite && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.content.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>{employeeName.get(c.employeeId) ?? c.employeeId}</TableCell>
                      <TableCell>
                        {c.categoryId ? categoryName.get(c.categoryId) ?? c.categoryId : '—'}
                      </TableCell>
                      <TableCell align="right">
                        {c.amount} {c.currency}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={c.status}
                          color={STATUS_COLOR[c.status]}
                          variant="outlined"
                        />
                      </TableCell>
                      {canWrite && (
                        <TableCell align="right">
                          {c.status === 'PENDING' && (
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                color="success"
                                onClick={() => setPending({ claim: c, action: 'approve' })}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => setPending({ claim: c, action: 'reject' })}
                              >
                                Reject
                              </Button>
                            </Stack>
                          )}
                          {c.status === 'APPROVED' && (
                            <Button
                              size="small"
                              onClick={() => setPending({ claim: c, action: 'reimburse' })}
                            >
                              Reimburse
                            </Button>
                          )}
                        </TableCell>
                      )}
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

      <ExpenseClaimFormDialog open={claimOpen} onClose={() => setClaimOpen(false)} />

      <ExpenseCategoriesDialog
        open={categoriesOpen}
        canWrite={canWrite}
        onClose={() => setCategoriesOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        title={`${actionLabel} claim`}
        message={`${actionLabel} this expense claim?`}
        confirmLabel={actionLabel}
        destructive={pending?.action === 'reject'}
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          if (pending) {
            await decide.mutateAsync({
              id: pending.claim.id,
              action: pending.action,
              payload: { note: null },
            });
          }
          setPending(null);
        }}
      />
    </Stack>
  );
}
