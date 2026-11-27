import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';

export interface CalendarEvent {
  type: 'HOLIDAY' | 'LEAVE';
  title: string;
  startDate: string;
  endDate: string;
  detail: string | null;
  color: string | null;
}

export interface HolidayPayload {
  name: string;
  holidayDate: string;
  description?: string;
  optional: boolean;
}

export const calendarKeys = {
  all: ['calendar'] as const,
  events: (from: string, to: string) => ['calendar', 'events', from, to] as const,
};

export function useCalendarEvents(from: string, to: string) {
  return useQuery({
    queryKey: calendarKeys.events(from, to),
    queryFn: async () =>
      unwrap(
        await http.get<ApiResponse<CalendarEvent[]>>(
          `/calendar?from=${from}&to=${to}`,
        ),
      ),
  });
}

export function useAddHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: HolidayPayload) =>
      unwrap(await http.post<ApiResponse<unknown>>('/calendar/holidays', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: calendarKeys.all }),
  });
}
