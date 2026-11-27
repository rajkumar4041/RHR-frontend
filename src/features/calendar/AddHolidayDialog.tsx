import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useAddHoliday } from './calendarApi';
import { errorMessage } from '@/lib/axios';

export function AddHolidayDialog({
  open,
  defaultDate,
  onClose,
}: {
  open: boolean;
  defaultDate: string;
  onClose: () => void;
}) {
  const add = useAddHoliday();
  const [name, setName] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [optional, setOptional] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await add.mutateAsync({ name: name.trim(), holidayDate: date, optional });
      setName('');
      onClose();
    } catch (err) {
      setError(errorMessage(err, 'Could not add holiday'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add holiday</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth autoFocus />
          <TextField
            label="Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
          />
          <FormControlLabel
            control={<Switch checked={optional} onChange={(e) => setOptional(e.target.checked)} />}
            label="Optional holiday"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={submit} variant="contained" disabled={!name.trim() || !date || add.isPending}>
          {add.isPending ? 'Adding…' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
