import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { PageResult } from '@/types/employee';
import type {
  Application,
  ApplicationPayload,
  ApplicationStagePayload,
  Candidate,
  CandidatePayload,
  JobPosting,
  JobPostingPayload,
} from '@/types/recruitment';

export const recruitmentKeys = {
  all: ['recruitment'] as const,
  jobs: (page: number, size: number, status?: string) =>
    [...recruitmentKeys.all, 'jobs', page, size, status ?? 'ALL'] as const,
  candidates: (page: number, size: number) =>
    [...recruitmentKeys.all, 'candidates', page, size] as const,
  applications: (page: number, size: number, jobPostingId?: string, stage?: string) =>
    [...recruitmentKeys.all, 'applications', page, size, jobPostingId ?? 'ALL', stage ?? 'ALL'] as const,
};

interface JobListParams {
  page: number;
  size: number;
  status?: string;
}

export function useJobPostings({ page, size, status }: JobListParams) {
  return useQuery({
    queryKey: recruitmentKeys.jobs(page, size, status),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (status) params.set('status', status);
      return unwrap(
        await http.get<ApiResponse<PageResult<JobPosting>>>(`/recruitment/jobs?${params.toString()}`),
      );
    },
  });
}

export function useCreateJobPosting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: JobPostingPayload) =>
      unwrap(await http.post<ApiResponse<JobPosting>>('/recruitment/jobs', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
}

export function useCloseJobPosting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap(await http.post<ApiResponse<JobPosting>>(`/recruitment/jobs/${id}/close`, {})),
    onSuccess: () => qc.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
}

interface CandidateListParams {
  page: number;
  size: number;
}

export function useCandidates({ page, size }: CandidateListParams) {
  return useQuery({
    queryKey: recruitmentKeys.candidates(page, size),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      return unwrap(
        await http.get<ApiResponse<PageResult<Candidate>>>(
          `/recruitment/candidates?${params.toString()}`,
        ),
      );
    },
  });
}

export function useCreateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CandidatePayload) =>
      unwrap(await http.post<ApiResponse<Candidate>>('/recruitment/candidates', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
}

interface ApplicationListParams {
  page: number;
  size: number;
  jobPostingId?: string;
  stage?: string;
}

export function useApplications({ page, size, jobPostingId, stage }: ApplicationListParams) {
  return useQuery({
    queryKey: recruitmentKeys.applications(page, size, jobPostingId, stage),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (jobPostingId) params.set('jobPostingId', jobPostingId);
      if (stage) params.set('stage', stage);
      return unwrap(
        await http.get<ApiResponse<PageResult<Application>>>(
          `/recruitment/applications?${params.toString()}`,
        ),
      );
    },
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ApplicationPayload) =>
      unwrap(await http.post<ApiResponse<Application>>('/recruitment/applications', payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
}

export function useUpdateApplicationStage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ApplicationStagePayload) =>
      unwrap(
        await http.post<ApiResponse<Application>>(`/recruitment/applications/${id}/stage`, payload),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
}
