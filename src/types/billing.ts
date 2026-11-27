export const INVOICE_STATUSES = ['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'VOID'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export interface Plan {
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

export interface Subscription {
  id: string;
  planId: string;
  planCode: string;
  planName: string;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  planId: string | null;
  billingCycle: string;
  periodStart: string | null;
  periodEnd: string | null;
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  currency: string;
  status: InvoiceStatus;
  issuedAt: string | null;
  dueDate: string | null;
  paidAt: string | null;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoicePayment {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  paidAt: string;
  notes: string | null;
}

export interface InvoiceDetail {
  invoice: InvoiceSummary;
  lineItems: InvoiceLineItem[];
  payments: InvoicePayment[];
}
