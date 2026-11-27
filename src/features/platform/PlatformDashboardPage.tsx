import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { usePlatformMetrics, usePlatformTenants, useSetTenantStatus } from './platformApi';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE: 'success',
  TRIAL: 'warning',
  SUSPENDED: 'error',
  CANCELLED: 'default',
};

export function PlatformDashboardPage() {
  const { data: metrics, isLoading: mLoading } = usePlatformMetrics();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const { data, isLoading } = usePlatformTenants(page, size);
  const setStatus = useSetTenantStatus();

  const money = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Platform console</Typography>
        <Typography color="text.secondary">Cross-tenant administration & revenue</Typography>
      </Box>

      {mLoading || !metrics ? (
        <CircularProgress />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2.5,
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          }}
        >
          <Stat label="Companies" value={metrics.totalCompanies} />
          <Stat label="Active" value={metrics.activeCompanies} />
          <Stat label="Trial" value={metrics.trialCompanies} />
          <Stat label="Suspended" value={metrics.suspendedCompanies} />
          <Stat label="Employees" value={metrics.totalEmployees} />
          <Stat label="Users" value={metrics.totalUsers} />
          <Stat label="MRR" value={money(metrics.mrr)} />
          <Stat label="ARR" value={money(metrics.arr)} />
        </Box>
      )}

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Companies
        </Typography>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : !data || data.content.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">No companies yet.</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Company</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.content.map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell>{t.companyName}</TableCell>
                      <TableCell>{t.slug}</TableCell>
                      <TableCell>{t.planCode ?? '—'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={t.status}
                          color={STATUS_COLOR[t.status] ?? 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {t.status === 'SUSPENDED' ? (
                          <Button
                            size="small"
                            color="success"
                            disabled={setStatus.isPending}
                            onClick={() => setStatus.mutate({ id: t.id, action: 'activate' })}
                          >
                            Activate
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            color="error"
                            disabled={setStatus.isPending}
                            onClick={() => setStatus.mutate({ id: t.id, action: 'suspend' })}
                          >
                            Suspend
                          </Button>
                        )}
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
    </Stack>
  );
}
