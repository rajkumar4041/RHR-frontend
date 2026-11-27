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
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import {
  useApprovePayslip,
  usePayPayslip,
  usePayslips,
} from './payrollApi';
import { SalaryStructureDialog } from './SalaryStructureDialog';
import { GeneratePayslipDialog } from './GeneratePayslipDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useEmployees } from '@/features/employees/employeeApi';
import { useHasAnyRole } from '@/features/auth/useRoles';
import type { Payslip, PayslipStatus } from '@/types/payroll';

const STATUS_COLOR: Record<PayslipStatus, 'default' | 'warning' | 'success'> = {
  DRAFT: 'default',
  APPROVED: 'warning',
  PAID: 'success',
};

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

function monthLabel(month: number): string {
  return MONTHS[month - 1] ?? String(month);
}

export function PayrollPage() {
  const hasAnyRole = useHasAnyRole();
  const canWrite = hasAnyRole('COMPANY_ADMIN', 'PAYROLL_MANAGER', 'FINANCE_MANAGER');

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [year, setYear] = useState<string>('');

  const [structureOpen, setStructureOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [toApprove, setToApprove] = useState<Payslip | null>(null);
  const [toPay, setToPay] = useState<Payslip | null>(null);

  const { data, isLoading, isError, refetch } = usePayslips({
    page,
    size,
    employeeId: employeeId || undefined,
    year: year ? Number(year) : undefined,
  });
  const { data: employees } = useEmployees({ page: 0, size: 100 });
  const approve = useApprovePayslip();
  const pay = usePayPayslip();

  const employeeName = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of employees?.content ?? []) {
      map.set(e.id, `${e.firstName} ${e.lastName} (${e.employeeCode})`);
    }
    return map;
  }, [employees]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4">Payroll</Typography>
          <Typography color="text.secondary">Salary structures and payslips</Typography>
        </Box>
        {canWrite && (
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<AccountBalanceWalletIcon />}
              onClick={() => setStructureOpen(true)}
            >
              Assign salary structure
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setGenerateOpen(true)}>
              Generate payslip
            </Button>
          </Stack>
        )}
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} sx={{ p: 2 }}>
          <TextField
            select
            size="small"
            label="Employee"
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">All employees</MenuItem>
            {(employees?.content ?? []).map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {e.firstName} {e.lastName} ({e.employeeCode})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Year"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All years</MenuItem>
            {YEARS.map((y) => (
              <MenuItem key={y} value={String(y)}>
                {y}
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
              Failed to load payslips.
            </Alert>
          </Box>
        ) : !data || data.content.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6">No payslips yet</Typography>
            <Typography color="text.secondary">
              {canWrite ? 'Generate a payslip to get started.' : 'Nothing to show.'}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell align="right">Gross</TableCell>
                    <TableCell align="right">Deductions</TableCell>
                    <TableCell align="right">Net</TableCell>
                    <TableCell>Status</TableCell>
                    {canWrite && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.content.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{employeeName.get(p.employeeId) ?? p.employeeId}</TableCell>
                      <TableCell>
                        {monthLabel(p.month)} {p.year}
                      </TableCell>
                      <TableCell align="right">{p.gross}</TableCell>
                      <TableCell align="right">{p.totalDeductions}</TableCell>
                      <TableCell align="right">{p.net}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={p.status}
                          color={STATUS_COLOR[p.status]}
                          variant="outlined"
                        />
                      </TableCell>
                      {canWrite && (
                        <TableCell align="right">
                          {p.status === 'DRAFT' && (
                            <Button size="small" onClick={() => setToApprove(p)}>
                              Approve
                            </Button>
                          )}
                          {p.status === 'APPROVED' && (
                            <Button size="small" onClick={() => setToPay(p)}>
                              Pay
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

      <SalaryStructureDialog open={structureOpen} onClose={() => setStructureOpen(false)} />
      <GeneratePayslipDialog open={generateOpen} onClose={() => setGenerateOpen(false)} />

      <ConfirmDialog
        open={Boolean(toApprove)}
        title="Approve payslip"
        message={`Approve the ${toApprove ? monthLabel(toApprove.month) : ''} ${toApprove?.year ?? ''} payslip for ${toApprove ? employeeName.get(toApprove.employeeId) ?? toApprove.employeeId : ''}?`}
        confirmLabel="Approve"
        onCancel={() => setToApprove(null)}
        onConfirm={async () => {
          if (toApprove) await approve.mutateAsync(toApprove.id);
          setToApprove(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(toPay)}
        title="Mark as paid"
        message={`Mark the ${toPay ? monthLabel(toPay.month) : ''} ${toPay?.year ?? ''} payslip for ${toPay ? employeeName.get(toPay.employeeId) ?? toPay.employeeId : ''} as paid?`}
        confirmLabel="Pay"
        onCancel={() => setToPay(null)}
        onConfirm={async () => {
          if (toPay) await pay.mutateAsync(toPay.id);
          setToPay(null);
        }}
      />
    </Stack>
  );
}
