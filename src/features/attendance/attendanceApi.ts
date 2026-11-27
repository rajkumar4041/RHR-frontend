import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { PageResult } from '@/types/employee';
import type { AttendanceCheckPayload, AttendanceRecord } from '@/types/attendance';

export const attendanceKeys = {
  all: ['attendance'] as const,
  list: (page: number, size: number, employeeId?: string, from?: string, to?: string) =>
    [...attendanceKeys.all, 'list', page, size, employeeId ?? 'ALL', from ?? '', to ?? ''] as const,
};

interface ListParams {
  page: number;
  size: number;
  employeeId?: string;
  from?: string;
  to?: string;
}

export function useAttendance({ page, size, employeeId, from, to }: ListParams) {
  return useQuery({
    queryKey: attendanceKeys.list(page, size, employeeId, from, to),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (employeeId) params.set('employeeId', employeeId);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      return unwrap(
        await http.get<ApiResponse<PageResult<AttendanceRecord>>>(
          `/attendance?${params.toString()}`,
        ),
      );
    },
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AttendanceCheckPayload) =>
      unwrap(await http.post<ApiResponse<AttendanceRecord>>('/attendance/check-in', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}

export function useCheckOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AttendanceCheckPayload) =>
      unwrap(await http.post<ApiResponse<AttendanceRecord>>('/attendance/check-out', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}
