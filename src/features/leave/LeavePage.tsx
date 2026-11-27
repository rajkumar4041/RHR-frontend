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
import TuneIcon from '@mui/icons-material/Tune';
import { useDecideLeave, useLeaveRequests, useLeaveTypes } from './leaveApi';
import { ApplyLeaveDialog } from './ApplyLeaveDialog';
import { LeaveTypesDialog } from './LeaveTypesDialog';
import { LEAVE_STATUSES, type LeaveStatus } from '@/types/leave';
import { useHasAnyRole } from '@/features/auth/useRoles';

const STATUS_COLOR: Record<LeaveStatus, 'success' | 'warning' | 'error' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
};

export function LeavePage() {
  const hasAnyRole = useHasAnyRole();
  const canDecide = hasAnyRole('COMPANY_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER');

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState('');
  const [applyOpen, setApplyOpen] = useState(false);
  const [typesOpen, setTypesOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useLeaveRequests(page, size, status || undefined);
  const { data: types } = useLeaveTypes();
  const decide = useDecideLeave();

  const typeName = (id: string) => types?.find((t) => t.id === id)?.name ?? '—';

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4">Leave</Typography>
          <Typography color="text.secondary">Applications and approvals</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          {canDecide && (
            <Button variant="outlined" startIcon={<TuneIcon />} onClick={() => setTypesOpen(true)}>
              Leave types
            </Button>
          )}
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setApplyOpen(true)}>
            Apply for leave
          </Button>
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
            {LEAVE_STATUSES.map((s) => (
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
              Failed to load leave requests.
            </Alert>
          </Box>
        ) : !data || data.content.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6">No leave requests</Typography>
            <Typography color="text.secondary">Apply for leave to get started.</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell align="right">Days</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    {canDecide && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.content.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{typeName(r.leaveTypeId)}</TableCell>
                      <TableCell>
                        {r.startDate} → {r.endDate}
                      </TableCell>
                      <TableCell align="right">{r.days}</TableCell>
                      <TableCell>{r.reason ?? '—'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={r.status}
                          color={STATUS_COLOR[r.status]}
                          variant="outlined"
                        />
                      </TableCell>
                      {canDecide && (
                        <TableCell align="right">
                          {r.status === 'PENDING' ? (
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                color="success"
                                disabled={decide.isPending}
                                onClick={() => decide.mutate({ id: r.id, action: 'approve' })}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                disabled={decide.isPending}
                                onClick={() => decide.mutate({ id: r.id, action: 'reject' })}
                              >
                                Reject
                              </Button>
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              —
                            </Typography>
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

      <ApplyLeaveDialog open={applyOpen} onClose={() => setApplyOpen(false)} />
      <LeaveTypesDialog open={typesOpen} onClose={() => setTypesOpen(false)} />
    </Stack>
  );
}
