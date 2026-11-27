import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { PageResult } from '@/types/employee';
import type {
  GeneratePayslipPayload,
  Payslip,
  SalaryStructure,
  SalaryStructurePayload,
} from '@/types/payroll';

export const payrollKeys = {
  all: ['payroll'] as const,
  payslips: (page: number, size: number, employeeId?: string, year?: number) =>
    [...payrollKeys.all, 'payslips', page, size, employeeId ?? 'ALL', year ?? 'ALL'] as const,
  structures: (employeeId?: string) =>
    [...payrollKeys.all, 'structures', employeeId ?? 'ALL'] as const,
};

interface PayslipListParams {
  page: number;
  size: number;
  employeeId?: string;
  year?: number;
}

export function usePayslips({ page, size, employeeId, year }: PayslipListParams) {
  return useQuery({
    queryKey: payrollKeys.payslips(page, size, employeeId, year),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (employeeId) params.set('employeeId', employeeId);
      if (year) params.set('year', String(year));
      return unwrap(
        await http.get<ApiResponse<PageResult<Payslip>>>(`/payroll/payslips?${params.toString()}`),
      );
    },
  });
}

export function useSalaryStructures(employeeId?: string) {
  return useQuery({
    queryKey: payrollKeys.structures(employeeId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (employeeId) params.set('employeeId', employeeId);
      const qs = params.toString();
      return unwrap(
        await http.get<ApiResponse<SalaryStructure[]>>(
          `/payroll/structures${qs ? `?${qs}` : ''}`,
        ),
      );
    },
    enabled: Boolean(employeeId),
  });
}

export function useGeneratePayslip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: GeneratePayslipPayload) =>
      unwrap(await http.post<ApiResponse<Payslip>>('/payroll/payslips', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: payrollKeys.all }),
  });
}

export function useApprovePayslip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap(await http.post<ApiResponse<Payslip>>(`/payroll/payslips/${id}/approve`, {})),
    onSuccess: () => qc.invalidateQueries({ queryKey: payrollKeys.all }),
  });
}

export function usePayPayslip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap(await http.post<ApiResponse<Payslip>>(`/payroll/payslips/${id}/pay`, {})),
    onSuccess: () => qc.invalidateQueries({ queryKey: payrollKeys.all }),
  });
}

export function useAssignSalaryStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SalaryStructurePayload) =>
      unwrap(await http.post<ApiResponse<SalaryStructure>>('/payroll/structures', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: payrollKeys.all }),
  });
}
