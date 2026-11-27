import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  Department,
  Designation,
  Employee,
  EmployeePayload,
  PageResult,
} from '@/types/employee';

export const employeeKeys = {
  all: ['employees'] as const,
  list: (page: number, size: number, status?: string) =>
    [...employeeKeys.all, 'list', page, size, status ?? 'ALL'] as const,
  detail: (id: string) => [...employeeKeys.all, 'detail', id] as const,
};

export const orgKeys = {
  departments: ['org', 'departments'] as const,
  designations: ['org', 'designations'] as const,
};

interface ListParams {
  page: number;
  size: number;
  status?: string;
}

export function useEmployees({ page, size, status }: ListParams) {
  return useQuery({
    queryKey: employeeKeys.list(page, size, status),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (status) params.set('status', status);
      return unwrap(
        await http.get<ApiResponse<PageResult<Employee>>>(`/employees?${params.toString()}`),
      );
    },
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EmployeePayload) =>
      unwrap(await http.post<ApiResponse<Employee>>('/employees', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeeKeys.all }),
  });
}

export function useUpdateEmployee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EmployeePayload) =>
      unwrap(await http.put<ApiResponse<Employee>>(`/employees/${id}`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeeKeys.all }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await http.delete(`/employees/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: employeeKeys.all }),
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: orgKeys.departments,
    queryFn: async () =>
      unwrap(await http.get<ApiResponse<Department[]>>('/org/departments')),
    staleTime: 5 * 60_000,
  });
}

export function useDesignations() {
  return useQuery({
    queryKey: orgKeys.designations,
    queryFn: async () =>
      unwrap(await http.get<ApiResponse<Designation[]>>('/org/designations')),
    staleTime: 5 * 60_000,
  });
}
