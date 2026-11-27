import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { PageResult } from '@/types/employee';
import type {
  AssignPayload,
  StatusPayload,
  Ticket,
  TicketPayload,
} from '@/types/helpdesk';

export const ticketKeys = {
  all: ['helpdesk', 'tickets'] as const,
  list: (page: number, size: number, status?: string, priority?: string) =>
    [...ticketKeys.all, 'list', page, size, status ?? 'ALL', priority ?? 'ALL'] as const,
};

interface ListParams {
  page: number;
  size: number;
  status?: string;
  priority?: string;
}

export function useTickets({ page, size, status, priority }: ListParams) {
  return useQuery({
    queryKey: ticketKeys.list(page, size, status, priority),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (status) params.set('status', status);
      if (priority) params.set('priority', priority);
      return unwrap(
        await http.get<ApiResponse<PageResult<Ticket>>>(
          `/helpdesk/tickets?${params.toString()}`,
        ),
      );
    },
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TicketPayload) =>
      unwrap(await http.post<ApiResponse<Ticket>>('/helpdesk/tickets', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ticketKeys.all }),
  });
}

export function useAssignTicket(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AssignPayload) =>
      unwrap(await http.post<ApiResponse<Ticket>>(`/helpdesk/tickets/${id}/assign`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ticketKeys.all }),
  });
}

export function useUpdateTicketStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: StatusPayload) =>
      unwrap(await http.post<ApiResponse<Ticket>>(`/helpdesk/tickets/${id}/status`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ticketKeys.all }),
  });
}
