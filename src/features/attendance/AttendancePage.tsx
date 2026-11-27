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
import LoginIcon from '@mui/icons-material/LoginOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import { useAttendance } from './attendanceApi';
import { CheckDialog } from './CheckDialog';
import { useEmployees } from '@/features/employees/employeeApi';
import { useHasAnyRole } from '@/features/auth/useRoles';
import type { AttendanceStatus } from '@/types/attendance';

const STATUS_COLOR: Record<AttendanceStatus, 'success' | 'warning' | 'error' | 'default'> = {
  PRESENT: 'success',
  HALF_DAY: 'warning',
  ON_LEAVE: 'default',
  ABSENT: 'error',
};

type DialogMode = 'check-in' | 'check-out';

function formatTime(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function AttendancePage() {
  const hasAnyRole = useHasAnyRole();
  const canWrite = hasAnyRole('COMPANY_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE');

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);

  const { data, isLoading, isError, refetch } = useAttendance({
    page,
    size,
    employeeId: employeeId || undefined,
  });
  const { data: employees } = useEmployees({ page: 0, size: 100 });

  const employeeName = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of employees?.content ?? []) {
      map.set(e.id, `${e.firstName} ${e.lastName}`);
    }
    return (id: string) => map.get(id) ?? id;
  }, [employees]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4">Attendance</Typography>
          <Typography color="text.secondary">Daily check-in and check-out records</Typography>
        </Box>
        {canWrite && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<LoginIcon />}
              onClick={() => setDialogMode('check-in')}
            >
              Check in
            </Button>
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={() => setDialogMode('check-out')}
            >
              Check out
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
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
              Failed to load attendance.
            </Alert>
          </Box>
        ) : !data || data.content.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6">No attendance records yet</Typography>
            <Typography color="text.secondary">
              {canWrite ? 'Record a check-in to get started.' : 'Nothing to show.'}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Check in</TableCell>
                    <TableCell>Check out</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.content.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{employeeName(r.employeeId)}</TableCell>
                      <TableCell>{r.workDate}</TableCell>
                      <TableCell>{formatTime(r.checkIn)}</TableCell>
                      <TableCell>{formatTime(r.checkOut)}</TableCell>
                      <TableCell align="right">{r.hoursWorked ?? '—'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={r.status.replace('_', ' ')}
                          color={STATUS_COLOR[r.status]}
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

      {canWrite && dialogMode && (
        <CheckDialog open mode={dialogMode} onClose={() => setDialogMode(null)} />
      )}
    </Stack>
  );
}
