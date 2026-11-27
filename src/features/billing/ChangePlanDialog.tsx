import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useChangePlan, usePlans } from './billingApi';
import { errorMessage } from '@/lib/axios';

export function ChangePlanDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: plans } = usePlans();
  const changePlan = useChangePlan();
  const [planCode, setPlanCode] = useState('');
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await changePlan.mutateAsync({ planCode, billingCycle });
      onClose();
    } catch (err) {
      setError(errorMessage(err, 'Could not change plan'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change plan</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField select label="Plan" value={planCode} onChange={(e) => setPlanCode(e.target.value)} fullWidth>
            {(plans ?? []).map((p) => (
              <MenuItem key={p.id} value={p.code}>
                <Box>
                  <Typography variant="body2">{p.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {p.currency} {p.priceMonthly}/mo · {p.priceAnnual}/yr
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Billing cycle" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} fullWidth>
            <MenuItem value="MONTHLY">Monthly</MenuItem>
            <MenuItem value="ANNUAL">Annual</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={submit} variant="contained" disabled={!planCode || changePlan.isPending}>
          {changePlan.isPending ? 'Saving…' : 'Change plan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
