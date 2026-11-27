export const LEAVE_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const;
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  daysPerYear: number;
  paid: boolean;
  carryForward: boolean;
  active: boolean;
}

export interface LeaveTypePayload {
  name: string;
  code: string;
  daysPerYear: number;
  paid: boolean;
  carryForward: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: LeaveStatus;
  decidedBy: string | null;
  decidedAt: string | null;
  decisionNote: string | null;
  createdAt: string;
}

export interface ApplyLeavePayload {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  entitled: number;
  used: number;
  remaining: number;
}
