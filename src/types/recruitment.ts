export const JOB_STATUSES = ['OPEN', 'CLOSED'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const APPLICATION_STAGES = [
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'HIRED',
  'REJECTED',
] as const;
export type ApplicationStage = (typeof APPLICATION_STAGES)[number];

export interface JobPosting {
  id: string;
  title: string;
  departmentId: string | null;
  description: string | null;
  openings: number;
  status: JobStatus;
}

export interface JobPostingPayload {
  title: string;
  description?: string | null;
  openings: number;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
}

export interface CandidatePayload {
  fullName: string;
  email: string;
  phone?: string | null;
}

export interface Application {
  id: string;
  jobPostingId: string;
  candidateId: string;
  stage: ApplicationStage;
  notes: string | null;
}

export interface ApplicationPayload {
  jobPostingId: string;
  candidateId: string;
}

export interface ApplicationStagePayload {
  stage: ApplicationStage;
  notes?: string | null;
}
