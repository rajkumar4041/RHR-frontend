export const GOAL_STATUSES = ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const;

export type GoalStatus = (typeof GOAL_STATUSES)[number];

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description: string | null;
  weight: number;
  dueDate: string | null;
  status: GoalStatus;
}

export interface GoalCreatePayload {
  employeeId: string;
  title: string;
  description: string | null;
  weight: number;
  dueDate: string | null;
}

export interface GoalUpdatePayload {
  title: string;
  description: string | null;
  weight: number;
  dueDate: string | null;
}
