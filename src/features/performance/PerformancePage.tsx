import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
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
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import { useChangeGoalStatus, useGoals } from './performanceApi';
import { GoalFormDialog } from './GoalFormDialog';
import { GOAL_STATUSES, type Goal, type GoalStatus } from '@/types/performance';
import { useEmployees } from '@/features/employees/employeeApi';
import { useHasAnyRole } from '@/features/auth/useRoles';

const STATUS_COLOR: Record<GoalStatus, 'default' | 'info' | 'success' | 'error'> = {
  DRAFT: 'default',
  ACTIVE: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

export function PerformancePage() {
  const hasAnyRole = useHasAnyRole();
  const canWrite = hasAnyRole('COMPANY_ADMIN', 'HR_MANAGER');

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [editing, setEditing] = useState<Goal | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useGoals({
    page,
    size,
    status: status || undefined,
  });
  const changeStatus = useChangeGoalStatus();
  const { data: employees } = useEmployees({ page: 0, size: 100 });

  const employeeName = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of employees?.content ?? []) {
      map.set(e.id, `${e.firstName} ${e.lastName}`);
    }
    return map;
  }, [employees]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (g: Goal) => {
    setEditing(g);
    setFormOpen(true);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4">Performance</Typography>
          <Typography color="text.secondary">Track employee goals and progress</Typography>
        </Box>
        {canWrite && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add goal
          </Button>
        )}
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
            {GOAL_STATUSES.map((s) => (
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
              Failed to load goals.
            </Alert>
          </Box>
        ) : !data || data.content.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6">No goals yet</Typography>
            <Typography color="text.secondary">
              {canWrite ? 'Add your first goal to get started.' : 'Nothing to show.'}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell align="right">Weight</TableCell>
                    <TableCell>Due date</TableCell>
                    <TableCell>Status</TableCell>
                    {canWrite && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.content.map((g) => (
                    <TableRow key={g.id} hover>
                      <TableCell>{employeeName.get(g.employeeId) ?? g.employeeId}</TableCell>
                      <TableCell>{g.title}</TableCell>
                      <TableCell align="right">{g.weight}</TableCell>
                      <TableCell>{g.dueDate ?? '—'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={g.status}
                          color={STATUS_COLOR[g.status]}
                          variant="outlined"
                        />
                      </TableCell>
                      {canWrite && (
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                            alignItems="center"
                          >
                            <TextField
                              select
                              size="small"
                              label="Status"
                              value={g.status}
                              onChange={(e) =>
                                changeStatus.mutate({
                                  id: g.id,
                                  status: e.target.value as GoalStatus,
                                })
                              }
                              sx={{ minWidth: 150 }}
                            >
                              {GOAL_STATUSES.map((s) => (
                                <MenuItem key={s} value={s}>
                                  {s}
                                </MenuItem>
                              ))}
                            </TextField>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openEdit(g)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
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

      <GoalFormDialog open={formOpen} goal={editing} onClose={() => setFormOpen(false)} />
    </Stack>
  );
}
