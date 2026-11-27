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
import PersonAddIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import { useCloseJobPosting, useJobPostings } from './recruitmentApi';
import { JobPostingFormDialog } from './JobPostingFormDialog';
import { CandidateFormDialog } from './CandidateFormDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { JOB_STATUSES, type JobPosting, type JobStatus } from '@/types/recruitment';
import { useHasAnyRole } from '@/features/auth/useRoles';

const STATUS_COLOR: Record<JobStatus, 'success' | 'default'> = {
  OPEN: 'success',
  CLOSED: 'default',
};

export function RecruitmentPage() {
  const hasAnyRole = useHasAnyRole();
  const canWrite = hasAnyRole('COMPANY_ADMIN', 'HR_MANAGER');

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [candidateFormOpen, setCandidateFormOpen] = useState(false);
  const [toClose, setToClose] = useState<JobPosting | null>(null);

  const { data, isLoading, isError, refetch } = useJobPostings({
    page,
    size,
    status: status || undefined,
  });
  const closeJob = useCloseJobPosting();

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4">Recruitment</Typography>
          <Typography color="text.secondary">Manage job postings and candidates</Typography>
        </Box>
        {canWrite && (
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={() => setCandidateFormOpen(true)}
            >
              New candidate
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setJobFormOpen(true)}>
              Post a job
            </Button>
          </Stack>
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
            {JOB_STATUSES.map((s) => (
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
              Failed to load job postings.
            </Alert>
          </Box>
        ) : !data || data.content.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6">No job postings yet</Typography>
            <Typography color="text.secondary">
              {canWrite ? 'Post your first job to get started.' : 'Nothing to show.'}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell align="right">Openings</TableCell>
                    <TableCell>Status</TableCell>
                    {canWrite && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.content.map((job) => (
                    <TableRow key={job.id} hover>
                      <TableCell>{job.title}</TableCell>
                      <TableCell align="right">{job.openings}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={job.status}
                          color={STATUS_COLOR[job.status]}
                          variant="outlined"
                        />
                      </TableCell>
                      {canWrite && (
                        <TableCell align="right">
                          {job.status === 'OPEN' && (
                            <Button size="small" color="error" onClick={() => setToClose(job)}>
                              Close
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

      <JobPostingFormDialog open={jobFormOpen} onClose={() => setJobFormOpen(false)} />
      <CandidateFormDialog open={candidateFormOpen} onClose={() => setCandidateFormOpen(false)} />

      <ConfirmDialog
        open={Boolean(toClose)}
        title="Close job posting"
        message={`Close "${toClose?.title}"? It will no longer accept applications.`}
        confirmLabel="Close job"
        destructive
        onCancel={() => setToClose(null)}
        onConfirm={async () => {
          if (toClose) await closeJob.mutateAsync(toClose.id);
          setToClose(null);
        }}
      />
    </Stack>
  );
}
