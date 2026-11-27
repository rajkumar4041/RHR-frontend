import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useAuthStore } from '@/stores/authStore';

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
}

function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ my: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {hint}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Welcome, {user?.firstName}</Typography>
        <Typography color="text.secondary">
          Here's an overview of your workspace. Modules are being rolled out phase by phase.
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
        }}
      >
        <StatCard label="Employees" value="—" hint="Employee module — coming soon" />
        <StatCard label="Present today" value="—" hint="Attendance module — coming soon" />
        <StatCard label="On leave" value="—" hint="Leave module — coming soon" />
        <StatCard label="Plan" value="Trial" hint="14-day free trial active" />
      </Box>
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your roles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.roles.join(', ') || 'None'}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
