import { MenuItem, TextField } from '@mui/material';
import { useUpdateTicketStatus } from './helpdeskApi';
import { TICKET_STATUSES, type Ticket, type TicketStatus } from '@/types/helpdesk';

interface Props {
  ticket: Ticket;
  disabled?: boolean;
}

/** Inline status changer bound to a single ticket row. */
export function TicketStatusSelect({ ticket, disabled }: Props) {
  const update = useUpdateTicketStatus(ticket.id);

  return (
    <TextField
      select
      size="small"
      value={ticket.status}
      disabled={disabled || update.isPending}
      onChange={(e) => update.mutate({ status: e.target.value as TicketStatus })}
      sx={{ minWidth: 160 }}
    >
      {TICKET_STATUSES.map((s) => (
        <MenuItem key={s} value={s}>
          {s.replace('_', ' ')}
        </MenuItem>
      ))}
    </TextField>
  );
}
