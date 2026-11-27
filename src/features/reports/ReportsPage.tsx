import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import { useQuery } from '@tanstack/react-query';
import { http, unwrap } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse } from '@/types/api';

interface Summary {
  totalEmployees: number;
  employeesByStatus: Record<string, number>;
  employeesByDepartment: Record<string, number>;
  leaveByStatus: Record<string, number>;
}

function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data ?? {});
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', flex: 1, minWidth: 220 }}>
      <CardContent>
        <Typography variant="subtitle2" gutterBottom>
          {title}
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No data
          </Typography>
        ) : (
          <Stack spacing={0.5}>
            {entries.map(([k, v]) => (
              <Stack key={k} direction="row" justifyContent="space-between">
                <Typography variant="body2">{k}</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {v}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: async () => unwrap(await http.get<ApiResponse<Summary>>('/reports/summary')),
  });

  const downloadCsv = async () => {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/reports/employees.csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4">Reports</Typography>
          <Typography color="text.secondary">Workforce summary & exports</Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadCsv}>
          Export employees (CSV)
        </Button>
      </Stack>

      {isLoading || !data ? (
        <CircularProgress />
      ) : (
        <Stack spacing={2.5}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Total employees
              </Typography>
              <Typography variant="h3">{data.totalEmployees}</Typography>
            </CardContent>
          </Card>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
            <Breakdown title="Employees by status" data={data.employeesByStatus} />
            <Breakdown title="Employees by department" data={data.employeesByDepartment} />
            <Breakdown title="Leave by status" data={data.leaveByStatus} />
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
