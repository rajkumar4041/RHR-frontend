import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { PageResult } from '@/types/employee';
import type {
  Goal,
  GoalCreatePayload,
  GoalStatus,
  GoalUpdatePayload,
} from '@/types/performance';

export const goalKeys = {
  all: ['performance', 'goals'] as const,
  list: (page: number, size: number, employeeId?: string, status?: string) =>
    [...goalKeys.all, 'list', page, size, employeeId ?? 'ALL', status ?? 'ALL'] as const,
};

interface ListParams {
  page: number;
  size: number;
  employeeId?: string;
  status?: string;
}

export function useGoals({ page, size, employeeId, status }: ListParams) {
  return useQuery({
    queryKey: goalKeys.list(page, size, employeeId, status),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (employeeId) params.set('employeeId', employeeId);
      if (status) params.set('status', status);
      return unwrap(
        await http.get<ApiResponse<PageResult<Goal>>>(
          `/performance/goals?${params.toString()}`,
        ),
      );
    },
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: GoalCreatePayload) =>
      unwrap(await http.post<ApiResponse<Goal>>('/performance/goals', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  });
}

export function useUpdateGoal(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: GoalUpdatePayload) =>
      unwrap(await http.put<ApiResponse<Goal>>(`/performance/goals/${id}`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  });
}

export function useChangeGoalStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: GoalStatus }) =>
      unwrap(
        await http.post<ApiResponse<Goal>>(`/performance/goals/${id}/status`, { status }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  });
}
