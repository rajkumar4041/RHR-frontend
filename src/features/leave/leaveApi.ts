import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { PageResult } from '@/types/employee';
import type {
  ApplyLeavePayload,
  LeaveRequest,
  LeaveType,
  LeaveTypePayload,
} from '@/types/leave';

export const leaveKeys = {
  all: ['leave'] as const,
  requests: (page: number, status?: string) =>
    [...leaveKeys.all, 'requests', page, status ?? 'ALL'] as const,
  types: [...['leave'], 'types'] as const,
};

export function useLeaveTypes() {
  return useQuery({
    queryKey: leaveKeys.types,
    queryFn: async () => unwrap(await http.get<ApiResponse<LeaveType[]>>('/leave/types')),
    staleTime: 5 * 60_000,
  });
}

export function useCreateLeaveType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LeaveTypePayload) =>
      unwrap(await http.post<ApiResponse<LeaveType>>('/leave/types', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: leaveKeys.types }),
  });
}

export function useLeaveRequests(page: number, size: number, status?: string) {
  return useQuery({
    queryKey: leaveKeys.requests(page, status),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (status) params.set('status', status);
      return unwrap(
        await http.get<ApiResponse<PageResult<LeaveRequest>>>(`/leave/requests?${params.toString()}`),
      );
    },
  });
}

export function useApplyLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ApplyLeavePayload) =>
      unwrap(await http.post<ApiResponse<LeaveRequest>>('/leave/requests', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: leaveKeys.all }),
  });
}

export function useDecideLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, note }: { id: string; action: 'approve' | 'reject'; note?: string }) =>
      unwrap(
        await http.post<ApiResponse<LeaveRequest>>(`/leave/requests/${id}/${action}`, { note }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: leaveKeys.all }),
  });
}
