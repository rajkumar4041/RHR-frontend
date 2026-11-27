export const EXPENSE_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'REIMBURSED'] as const;

export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  categoryId: string | null;
  amount: number;
  currency: string;
  description: string | null;
  status: ExpenseStatus;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  code: string;
}

export interface ExpenseClaimPayload {
  employeeId: string;
  categoryId: string | null;
  amount: number;
  currency: string;
  description: string | null;
}

export interface ExpenseCategoryPayload {
  name: string;
  code: string;
}

export interface ExpenseDecisionPayload {
  note: string | null;
}
