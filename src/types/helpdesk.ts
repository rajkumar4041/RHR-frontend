export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export interface Ticket {
  id: string;
  subject: string;
  description: string | null;
  category: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  raisedByUserId: string;
  assignedToUserId: string | null;
}

export interface TicketPayload {
  subject: string;
  description?: string | null;
  category?: string | null;
  priority: TicketPriority;
}

export interface AssignPayload {
  assignedToUserId: string;
}

export interface StatusPayload {
  status: TicketStatus;
}
