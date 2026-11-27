export const PAYSLIP_STATUSES = ['DRAFT', 'APPROVED', 'PAID'] as const;

export type PayslipStatus = (typeof PAYSLIP_STATUSES)[number];

export interface Payslip {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  gross: number;
  totalDeductions: number;
  net: number;
  status: PayslipStatus;
  generatedAt: string;
}

export interface SalaryStructure {
  id: string;
  employeeId: string;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  effectiveFrom: string;
  active: boolean;
}

export interface GeneratePayslipPayload {
  employeeId: string;
  month: number;
  year: number;
}

export interface SalaryStructurePayload {
  employeeId: string;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  effectiveFrom: string;
}
