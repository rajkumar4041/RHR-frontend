import { useState } from 'react';
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
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { useDeleteEmployee, useEmployees } from './employeeApi';
import { EmployeeFormDialog } from './EmployeeFormDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EMPLOYMENT_STATUSES, type Employee, type EmploymentStatus } from '@/types/employee';
import { useHasAnyRole } from '@/features/auth/useRoles';

const STATUS_COLOR: Record<EmploymentStatus, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE: 'success',
  ON_LEAVE: 'warning',
  SUSPENDED: 'warning',
  TERMINATED: 'error',
  RESIGNED: 'default',
};

export function EmployeesPage() {
  const hasAnyRole = useHasAnyRole();
  const canWrite = hasAnyRole('COMPANY_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE');

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [editing, setEditing] = useState<Employee | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Employee | null>(null);

  const { data, isLoading, isError, refetch } = useEmployees({ page, size, status: status || undefined });
  const deleteEmployee = useDeleteEmployee();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (e: Employee) => {
    setEditing(e);
    setFormOpen(true);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4">Employees</Typography>
          <Typography color="text.secondary">Manage your organisation's people</Typography>
        </Box>
        {canWrite && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add employee
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
            {EMPLOYMENT_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s.replace('_', ' ')}
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
              Failed to load employees.
            </Alert>
          </Box>
        ) : !data || data.content.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6">No employees yet</Typography>
            <Typography color="text.secondary">
              {canWrite ? 'Add your first employee to get started.' : 'Nothing to show.'}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    {canWrite && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.content.map((e) => (
                    <TableRow key={e.id} hover>
                      <TableCell>{e.employeeCode}</TableCell>
                      <TableCell>
                        {e.firstName} {e.lastName}
                      </TableCell>
                      <TableCell>{e.email}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={e.employmentStatus.replace('_', ' ')}
                          color={STATUS_COLOR[e.employmentStatus]}
                          variant="outlined"
                        />
                      </TableCell>
                      {canWrite && (
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(e)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setToDelete(e)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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

      <EmployeeFormDialog open={formOpen} employee={editing} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete employee"
        message={`Delete ${toDelete?.firstName} ${toDelete?.lastName}? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await deleteEmployee.mutateAsync(toDelete.id);
          setToDelete(null);
        }}
      />
    </Stack>
  );
}
