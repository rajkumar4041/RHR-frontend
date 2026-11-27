import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import { useCalendarEvents, type CalendarEvent } from './calendarApi';
import { AddHolidayDialog } from './AddHolidayDialog';
import { useHasAnyRole } from '@/features/auth/useRoles';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function DashboardCalendar() {
  const canManage = useHasAnyRole()('COMPANY_ADMIN', 'HR_MANAGER');
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [addOpen, setAddOpen] = useState(false);

  const { year, month } = cursor;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const from = iso(year, month, 1);
  const to = iso(year, month, daysInMonth);
  const todayStr = iso(now.getFullYear(), now.getMonth(), now.getDate());

  const { data: events, isLoading } = useCalendarEvents(from, to);

  const cells = useMemo(() => {
    const list: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) list.push(d);
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [firstWeekday, daysInMonth]);

  const eventsOn = (dateStr: string): CalendarEvent[] =>
    (events ?? []).filter((e) => e.startDate <= dateStr && dateStr <= e.endDate);

  const monthLabel = new Date(year, month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const shift = (delta: number) => {
    const m = month + delta;
    setCursor({ year: year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 });
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6">Calendar</Typography>
          <IconButton size="small" onClick={() => shift(-1)}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" sx={{ minWidth: 150, textAlign: 'center' }}>
            {monthLabel}
          </Typography>
          <IconButton size="small" onClick={() => shift(1)}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Stack>
        {canManage && (
          <Button size="small" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
            Add holiday
          </Button>
        )}
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
            {WEEKDAYS.map((w) => (
              <Typography key={w} variant="caption" color="text.secondary" align="center" fontWeight={600}>
                {w}
              </Typography>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
            {cells.map((d, i) => {
              if (d === null) return <Box key={`b${i}`} sx={{ minHeight: 76 }} />;
              const dateStr = iso(year, month, d);
              const dayEvents = eventsOn(dateStr);
              const isToday = dateStr === todayStr;
              return (
                <Box
                  key={dateStr}
                  sx={{
                    minHeight: 76,
                    border: '1px solid',
                    borderColor: isToday ? 'primary.main' : 'divider',
                    borderRadius: 1.5,
                    p: 0.5,
                    bgcolor: isToday ? 'action.hover' : 'transparent',
                  }}
                >
                  <Typography variant="caption" fontWeight={isToday ? 700 : 500}>
                    {d}
                  </Typography>
                  <Stack spacing={0.25} mt={0.25}>
                    {dayEvents.slice(0, 2).map((e, idx) => (
                      <Tooltip key={idx} title={`${e.title}${e.detail ? ` (${e.detail})` : ''}`}>
                        <Box
                          sx={{
                            fontSize: 10,
                            lineHeight: 1.3,
                            px: 0.5,
                            borderRadius: 0.5,
                            color: '#fff',
                            bgcolor: e.color ?? '#64748b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {e.title}
                        </Box>
                      </Tooltip>
                    ))}
                    {dayEvents.length > 2 && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                        +{dayEvents.length - 2} more
                      </Typography>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Box>
          <Stack direction="row" spacing={2} mt={2}>
            <Chip size="small" label="Holiday" sx={{ bgcolor: '#16a34a', color: '#fff' }} />
            <Chip size="small" label="Approved leave" sx={{ bgcolor: '#4f46e5', color: '#fff' }} />
            <Chip size="small" label="Pending leave" sx={{ bgcolor: '#d97706', color: '#fff' }} />
          </Stack>
        </>
      )}

      <AddHolidayDialog open={addOpen} defaultDate={todayStr} onClose={() => setAddOpen(false)} />
    </Paper>
  );
}
