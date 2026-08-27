// ── Enums ──

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskType {
  TASK = 'TASK',
  SUBTASK = 'SUBTASK',
  BUG = 'BUG',
  STORY = 'STORY',
  EPIC = 'EPIC',
  ISSUE = 'ISSUE',
}

export enum RoleInTask {
  ASSIGNEE = 'ASSIGNEE',
  REVIEWER = 'REVIEWER',
  WATCHER = 'WATCHER',
}

export enum TaskAssignmentStatus {
  ACTIVE = 'ACTIVE',
  UNASSIGNED = 'UNASSIGNED',
}

export enum DependencyType {
  BLOCKS = 'BLOCKS',
  BLOCKED_BY = 'BLOCKED_BY',
  RELATES_TO = 'RELATES_TO',
}

// ── Response Interfaces ──

export interface TaskAssignmentResponse {
  id: string;
  taskId: string;
  userId: string;
  role: RoleInTask;
  allocationPercentage: number;
  status: TaskAssignmentStatus;
  assignedAt: string;
  unassignedAt: string | null;
}

export interface TaskCommentResponse {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDependencyResponse {
  id: string;
  taskId: string;
  dependOnTaskId: string;
  type: DependencyType;
  createdAt: string;
}

export interface TaskAttachmentResponse {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}

export interface TaskStatusHistoryResponse {
  id: string;
  taskId: string;
  oldStatus: TaskStatus | null;
  newStatus: TaskStatus;
  changedBy: string;
  comment: string | null;
  changedAt: string;
}

export interface TaskResponse {
  id: string;
  projectId: string;
  milestoneId: string | null;
  title: string;
  description: string | null;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  dueDate: string | null;
  completedAt: string | null;
  createdBy: string;
  reporterId: string | null;
  createdAt: string;
  updatedAt: string | null;
  assignments: TaskAssignmentResponse[];
  comments: TaskCommentResponse[];
  attachments: TaskAttachmentResponse[];
  dependencies: TaskDependencyResponse[];
  statusHistory: TaskStatusHistoryResponse[];
}

// ── Request Interfaces ──

export interface CreateTaskRequest {
  projectId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  type: TaskType;
  status?: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate?: string;
  reporterId?: string;
  assignments?: CreateTaskAssignmentRequest[];
  dependencies?: CreateTaskDependencyRequest[];
  attachments?: unknown[];
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  startDate: string;
  dueDate?: string;
  milestoneId?: string;
}

export interface ChangeTaskStatusRequest {
  newStatus: TaskStatus;
  comment?: string;
}

export interface CreateTaskAssignmentRequest {
  userId: string;
  role: RoleInTask;
  allocationPercentage: number;
}

export interface UpdateTaskAssignmentRequest {
  role: RoleInTask;
  allocationPercentage: number;
}

export interface CreateTaskCommentRequest {
  content: string;
}

export interface UpdateTaskCommentRequest {
  content: string;
}

export interface CreateTaskDependencyRequest {
  dependOnTaskId: string;
  type: DependencyType;
}

// ── API Response Wrappers ──

export interface TasksListMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface TasksApiResponse {
  success: boolean;
  data: TaskResponse[];
  meta: TasksListMeta | null;
  timestamp: string;
}

export interface SingleTaskApiResponse {
  success: boolean;
  data: TaskResponse;
  timestamp: string;
}

export interface TaskAssignmentApiResponse {
  success: boolean;
  data: TaskAssignmentResponse;
  timestamp: string;
}

export interface TaskAssignmentsListApiResponse {
  success: boolean;
  data: TaskAssignmentResponse[];
  timestamp: string;
}

export interface TaskCommentApiResponse {
  success: boolean;
  data: TaskCommentResponse;
  timestamp: string;
}

export interface TaskCommentsListApiResponse {
  success: boolean;
  data: TaskCommentResponse[];
  timestamp: string;
}

export interface TaskDependencyApiResponse {
  success: boolean;
  data: TaskDependencyResponse;
  timestamp: string;
}

export interface TaskDependenciesListApiResponse {
  success: boolean;
  data: TaskDependencyResponse[];
  timestamp: string;
}

// ── UI Label & Color Maps ──

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.IN_REVIEW]: 'In Review',
  [TaskStatus.DONE]: 'Done',
  [TaskStatus.CANCELLED]: 'Cancelled',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'var(--color-text-muted)',
  [TaskStatus.IN_PROGRESS]: 'var(--color-primary)',
  [TaskStatus.IN_REVIEW]: 'var(--color-warning)',
  [TaskStatus.DONE]: 'var(--color-success)',
  [TaskStatus.CANCELLED]: 'var(--color-danger)',
};

export const TASK_STATUS_BG_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'var(--color-bg-muted)',
  [TaskStatus.IN_PROGRESS]: 'var(--color-primary-soft)',
  [TaskStatus.IN_REVIEW]: 'var(--color-warning-soft)',
  [TaskStatus.DONE]: 'var(--color-success-soft)',
  [TaskStatus.CANCELLED]: 'var(--color-danger-soft)',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Low',
  [TaskPriority.MEDIUM]: 'Medium',
  [TaskPriority.HIGH]: 'High',
  [TaskPriority.URGENT]: 'Urgent',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'var(--color-success)',
  [TaskPriority.MEDIUM]: 'var(--color-warning)',
  [TaskPriority.HIGH]: 'var(--color-danger)',
  [TaskPriority.URGENT]: 'var(--color-danger)',
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  [TaskType.TASK]: 'Task',
  [TaskType.SUBTASK]: 'Subtask',
  [TaskType.BUG]: 'Bug',
  [TaskType.STORY]: 'Story',
  [TaskType.EPIC]: 'Epic',
  [TaskType.ISSUE]: 'Issue',
};

export const TASK_TYPE_COLORS: Record<TaskType, string> = {
  [TaskType.TASK]: 'var(--color-primary)',
  [TaskType.SUBTASK]: 'var(--color-info)',
  [TaskType.BUG]: 'var(--color-danger)',
  [TaskType.STORY]: 'var(--color-success)',
  [TaskType.EPIC]: '#8b5cf6',
  [TaskType.ISSUE]: 'var(--color-warning)',
};

export const ROLE_IN_TASK_LABELS: Record<RoleInTask, string> = {
  [RoleInTask.ASSIGNEE]: 'Assignee',
  [RoleInTask.REVIEWER]: 'Reviewer',
  [RoleInTask.WATCHER]: 'Watcher',
};

export const DEPENDENCY_TYPE_LABELS: Record<DependencyType, string> = {
  [DependencyType.BLOCKS]: 'Blocks',
  [DependencyType.BLOCKED_BY]: 'Blocked by',
  [DependencyType.RELATES_TO]: 'Relates to',
};

export const ALL_TASK_STATUSES: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
  TaskStatus.CANCELLED,
];

export const ALL_TASK_PRIORITIES: TaskPriority[] = [
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
  TaskPriority.URGENT,
];

export const ALL_TASK_TYPES: TaskType[] = [
  TaskType.TASK,
  TaskType.SUBTASK,
  TaskType.BUG,
  TaskType.STORY,
  TaskType.EPIC,
  TaskType.ISSUE,
];

export const ALL_ROLES_IN_TASK: RoleInTask[] = [
  RoleInTask.ASSIGNEE,
  RoleInTask.REVIEWER,
  RoleInTask.WATCHER,
];

export const ALL_DEPENDENCY_TYPES: DependencyType[] = [
  DependencyType.BLOCKS,
  DependencyType.BLOCKED_BY,
  DependencyType.RELATES_TO,
];
