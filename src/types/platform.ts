export interface PlatformMetrics {
  totalCompanies: number;
  trialCompanies: number;
  activeCompanies: number;
  suspendedCompanies: number;
  cancelledCompanies: number;
  totalEmployees: number;
  totalUsers: number;
  mrr: number;
  arr: number;
}

export interface TenantSummary {
  id: string;
  companyName: string;
  slug: string;
  status: string;
  planCode: string | null;
  createdAt: string;
}

export interface PlatformPlan {
  id: string;
  code: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  employeeLimit: number | null;
  storageLimitMb: number | null;
  active: boolean;
}
