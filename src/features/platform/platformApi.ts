import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { PageResult } from '@/types/employee';
import type { PlatformMetrics, PlatformPlan, TenantSummary } from '@/types/platform';

export const platformKeys = {
  all: ['platform'] as const,
  metrics: ['platform', 'metrics'] as const,
  tenants: (page: number) => ['platform', 'tenants', page] as const,
  plans: ['platform', 'plans'] as const,
};

export function usePlatformMetrics() {
  return useQuery({
    queryKey: platformKeys.metrics,
    queryFn: async () => unwrap(await http.get<ApiResponse<PlatformMetrics>>('/platform/metrics')),
  });
}

export function usePlatformTenants(page: number, size: number) {
  return useQuery({
    queryKey: platformKeys.tenants(page),
    queryFn: async () =>
      unwrap(
        await http.get<ApiResponse<PageResult<TenantSummary>>>(
          `/platform/tenants?page=${page}&size=${size}`,
        ),
      ),
  });
}

export function useSetTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'suspend' | 'activate' }) =>
      unwrap(await http.post<ApiResponse<TenantSummary>>(`/platform/tenants/${id}/${action}`, {})),
    onSuccess: () => qc.invalidateQueries({ queryKey: platformKeys.all }),
  });
}

export function usePlatformPlans() {
  return useQuery({
    queryKey: platformKeys.plans,
    queryFn: async () => unwrap(await http.get<ApiResponse<PlatformPlan[]>>('/platform/plans')),
  });
}

export function useUpsertPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      code: string;
      name: string;
      priceMonthly: number;
      priceAnnual: number;
      currency?: string;
      employeeLimit?: number | null;
      storageLimitMb?: number | null;
      active?: boolean;
    }) => unwrap(await http.post<ApiResponse<PlatformPlan>>('/platform/plans', body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: platformKeys.plans }),
  });
}
