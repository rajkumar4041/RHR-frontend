import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { PageResult } from '@/types/employee';
import type {
  InvoiceDetail,
  InvoiceSummary,
  Plan,
  Subscription,
} from '@/types/billing';

export const billingKeys = {
  all: ['billing'] as const,
  subscription: ['billing', 'subscription'] as const,
  plans: ['billing', 'plans'] as const,
  invoices: (page: number, status?: string) =>
    ['billing', 'invoices', page, status ?? 'ALL'] as const,
  invoice: (id: string) => ['billing', 'invoice', id] as const,
};

export function usePlans() {
  return useQuery({
    queryKey: billingKeys.plans,
    queryFn: async () => unwrap(await http.get<ApiResponse<Plan[]>>('/billing/plans')),
    staleTime: 5 * 60_000,
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: billingKeys.subscription,
    queryFn: async () => unwrap(await http.get<ApiResponse<Subscription>>('/billing/subscription')),
  });
}

export function useChangePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { planCode: string; billingCycle: string }) =>
      unwrap(await http.post<ApiResponse<Subscription>>('/billing/subscription/change-plan', body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.all }),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      unwrap(await http.post<ApiResponse<Subscription>>('/billing/subscription/cancel', {})),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.subscription }),
  });
}

export function useInvoices(page: number, size: number, status?: string) {
  return useQuery({
    queryKey: billingKeys.invoices(page, status),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (status) params.set('status', status);
      return unwrap(
        await http.get<ApiResponse<PageResult<InvoiceSummary>>>(`/billing/invoices?${params.toString()}`),
      );
    },
  });
}

export function useInvoiceDetail(id: string | null) {
  return useQuery({
    queryKey: billingKeys.invoice(id ?? 'none'),
    queryFn: async () => unwrap(await http.get<ApiResponse<InvoiceDetail>>(`/billing/invoices/${id}`)),
    enabled: Boolean(id),
  });
}

export function useGenerateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { periodStart: string; periodEnd: string; taxPercent: number; dueDate?: string }) =>
      unwrap(await http.post<ApiResponse<InvoiceDetail>>('/billing/invoices/generate', body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.all }),
  });
}

export function useInvoiceAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, body }: { id: string; action: 'issue' | 'void' | 'record-payment'; body?: unknown }) =>
      unwrap(await http.post<ApiResponse<unknown>>(`/billing/invoices/${id}/${action}`, body ?? {})),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.all }),
  });
}
