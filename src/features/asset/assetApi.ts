import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { PageResult } from '@/types/employee';
import type {
  Asset,
  AssignAssetPayload,
  CreateAssetPayload,
  ReturnAssetPayload,
  UpdateAssetPayload,
} from '@/types/asset';

export const assetKeys = {
  all: ['assets'] as const,
  list: (page: number, size: number, status?: string) =>
    [...assetKeys.all, 'list', page, size, status ?? 'ALL'] as const,
  detail: (id: string) => [...assetKeys.all, 'detail', id] as const,
};

interface ListParams {
  page: number;
  size: number;
  status?: string;
}

export function useAssets({ page, size, status }: ListParams) {
  return useQuery({
    queryKey: assetKeys.list(page, size, status),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (status) params.set('status', status);
      return unwrap(
        await http.get<ApiResponse<PageResult<Asset>>>(`/assets?${params.toString()}`),
      );
    },
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAssetPayload) =>
      unwrap(await http.post<ApiResponse<Asset>>('/assets', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: assetKeys.all }),
  });
}

export function useUpdateAsset(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateAssetPayload) =>
      unwrap(await http.put<ApiResponse<Asset>>(`/assets/${id}`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: assetKeys.all }),
  });
}

export function useAssignAsset(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AssignAssetPayload) =>
      unwrap(await http.post<ApiResponse<Asset>>(`/assets/${id}/assign`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: assetKeys.all }),
  });
}

export function useReturnAsset(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ReturnAssetPayload) =>
      unwrap(await http.post<ApiResponse<Asset>>(`/assets/${id}/return`, payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: assetKeys.all }),
  });
}
