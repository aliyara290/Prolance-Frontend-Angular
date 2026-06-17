export type MilestoneStatus = 'ACTIVE' | 'IN_PROGRESS' | 'ARCHIVED' | 'ON_HOLD' | 'CANCELLED' | 'COMPLETED';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  sequenceOrder: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestoneRequest {
  title: string;
  description: string | null;
  startDate: string | null;
  dueDate: string | null;
  sequenceOrder: number;
  progressPercentage: number;
  status: MilestoneStatus;
}

export interface UpdateMilestoneRequest {
  title: string;
  description: string | null;
  startDate: string | null;
  dueDate: string | null;
  sequenceOrder: number;
  progressPercentage: number;
  status: MilestoneStatus;
}

export interface MilestoneStatistics {
  totalMilestones: number;
  completedMilestones: number;
  activeMilestones: number;
  overdueMilestones: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: ApiMeta | null;
  timestamp?: string;
}

export interface ApiMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
