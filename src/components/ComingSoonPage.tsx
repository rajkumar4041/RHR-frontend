import { Box, Paper, Stack, Typography } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

/** Honest placeholder for modules not yet implemented — never a dead button. */
export function ComingSoonPage({ title }: { title: string }) {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">{title}</Typography>
      <Paper
        elevation={0}
        sx={{
          p: 6,
          border: '1px dashed',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Box sx={{ color: 'text.secondary', mb: 1 }}>
          <ConstructionIcon fontSize="large" />
        </Box>
        <Typography variant="h6">Coming soon</Typography>
        <Typography variant="body2" color="text.secondary">
          The {title} module is being built in an upcoming phase.
        </Typography>
      </Paper>
    </Stack>
  );
}
