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
import { useTickets } from './helpdeskApi';
import { TicketFormDialog } from './TicketFormDialog';
import { TicketStatusSelect } from './TicketStatusSelect';
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketPriority,
  type TicketStatus,
} from '@/types/helpdesk';
import { useHasAnyRole } from '@/features/auth/useRoles';

const PRIORITY_COLOR: Record<TicketPriority, 'default' | 'info' | 'warning' | 'error'> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'error',
};

const STATUS_COLOR: Record<TicketStatus, 'warning' | 'info' | 'success' | 'default'> = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'default',
};

export function HelpdeskPage() {
  const hasAnyRole = useHasAnyRole();
  const canManage = hasAnyRole('COMPANY_ADMIN', 'HR_MANAGER');

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useTickets({
    page,
    size,
    status: status || undefined,
    priority: priority || undefined,
  });

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4">Helpdesk</Typography>
          <Typography color="text.secondary">Raise and track support tickets</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          Raise ticket
        </Button>
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
            {TICKET_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s.replace('_', ' ')}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Priority"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All priorities</MenuItem>
            {TICKET_PRIORITIES.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
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
              Failed to load tickets.
            </Alert>
          </Box>
        ) : !data || data.content.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6">No tickets yet</Typography>
            <Typography color="text.secondary">Raise your first ticket to get started.</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.content.map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell>{t.subject}</TableCell>
                      <TableCell>{t.category ?? '—'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={t.priority}
                          color={PRIORITY_COLOR[t.priority]}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={t.status.replace('_', ' ')}
                          color={STATUS_COLOR[t.status]}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TicketStatusSelect ticket={t} disabled={!canManage} />
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

      <TicketFormDialog open={formOpen} onClose={() => setFormOpen(false)} />
    </Stack>
  );
}
