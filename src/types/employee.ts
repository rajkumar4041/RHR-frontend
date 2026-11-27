export const EMPLOYMENT_STATUSES = [
  'ACTIVE',
  'ON_LEAVE',
  'SUSPENDED',
  'TERMINATED',
  'RESIGNED',
] as const;

export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  departmentId: string | null;
  designationId: string | null;
  reportingManagerId: string | null;
  dateOfJoining: string | null;
  employmentStatus: EmploymentStatus;
  createdAt: string;
}

export interface EmployeePayload {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId?: string | null;
  designationId?: string | null;
  reportingManagerId?: string | null;
  dateOfJoining?: string | null;
  employmentStatus?: EmploymentStatus;
}

export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
}

export interface Designation {
  id: string;
  title: string;
  code: string;
}
