export enum ProjectStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Project {
  id: string;
  clientId: string | null;
  ownerId: string;
  opportunityId: string | null;
  name: string;
  description: string | null;
  prefix: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  estimatedBudget: number;
  actualCost: number;
  progress: number;
  projectManagerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsNames {
  id: string;
  name: string;
  prefix: string;
  status: ProjectStatus;
}

export interface ProjectsNamesResponse {
  success: boolean;
  data: ProjectsNames[];
}

export interface CreateProjectRequest {
  clientId: string | null;
  opportunityId: string | null;
  name: string;
  description: string | null;
  priority: ProjectPriority;
  plannedStartDate: string;
  plannedEndDate: string;
  estimatedBudget: number;
  projectManagerId: string | null;
}

export interface UpdateProjectRequest {
  name: string;
  description: string | null;
  prefix: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  estimatedBudget: number;
  actualCost: number;
  projectManagerId: string | null;
}

export interface ProjectsListMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
