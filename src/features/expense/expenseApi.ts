import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { PageResult } from '@/types/employee';
import type {
  ExpenseCategory,
  ExpenseCategoryPayload,
  ExpenseClaim,
  ExpenseClaimPayload,
  ExpenseDecisionPayload,
} from '@/types/expense';

export const expenseKeys = {
  all: ['expense'] as const,
  claims: ['expense', 'claims'] as const,
  claimList: (page: number, size: number, employeeId?: string, status?: string) =>
    [...expenseKeys.claims, 'list', page, size, employeeId ?? 'ALL', status ?? 'ALL'] as const,
  categories: ['expense', 'categories'] as const,
};

interface ClaimListParams {
  page: number;
  size: number;
  employeeId?: string;
  status?: string;
}

export function useExpenseClaims({ page, size, employeeId, status }: ClaimListParams) {
  return useQuery({
    queryKey: expenseKeys.claimList(page, size, employeeId, status),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (employeeId) params.set('employeeId', employeeId);
      if (status) params.set('status', status);
      return unwrap(
        await http.get<ApiResponse<PageResult<ExpenseClaim>>>(
          `/expense/claims?${params.toString()}`,
        ),
      );
    },
  });
}

export function useCreateExpenseClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ExpenseClaimPayload) =>
      unwrap(await http.post<ApiResponse<ExpenseClaim>>('/expense/claims', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.claims }),
  });
}

type ClaimAction = 'approve' | 'reject' | 'reimburse';

interface ClaimDecisionArgs {
  id: string;
  action: ClaimAction;
  payload: ExpenseDecisionPayload;
}

export function useDecideExpenseClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, payload }: ClaimDecisionArgs) =>
      unwrap(
        await http.post<ApiResponse<ExpenseClaim>>(`/expense/claims/${id}/${action}`, payload),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.claims }),
  });
}

export function useExpenseCategories() {
  return useQuery({
    queryKey: expenseKeys.categories,
    queryFn: async () =>
      unwrap(await http.get<ApiResponse<ExpenseCategory[]>>('/expense/categories')),
    staleTime: 5 * 60_000,
  });
}

export function useCreateExpenseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ExpenseCategoryPayload) =>
      unwrap(await http.post<ApiResponse<ExpenseCategory>>('/expense/categories', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.categories }),
  });
}
