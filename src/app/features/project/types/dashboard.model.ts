export interface ChartStatusCount {
  status: string;
  count: number;
}

export interface ChartPriorityCount {
  priority: string;
  count: number;
}

export interface ChartMonthlyCount {
  month: string;
  year: number;
  count: number;
}

// ==================== PROJECT KPI MODELS ====================

export interface ProjectKpiSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  cancelledProjects: number;
  plannedProjects: number;
  overdueProjects: number;
  projectsCreatedThisMonth: number;
  projectsCreatedLastMonth: number;
  projectsCreatedMonthChangePercent: number;
  projectsCompletedThisMonth: number;
  projectsCompletedLastMonth: number;
  projectsCompletedMonthChangePercent: number;
  completionRate: number;
}

export interface ProjectDashboardCharts {
  projectsByStatus: ChartStatusCount[];
  projectsCreatedPerMonth: ChartMonthlyCount[];
  projectsCompletedPerMonth: ChartMonthlyCount[];
}

export interface RecentProject {
  id: string;
  name: string;
  prefix: string;
  status: string;
  priority: string;
  createdAt: string;
  completedAt: string | null;
}

export interface ProjectRecentActivity {
  recentlyCreated: RecentProject[];
  recentlyCompleted: RecentProject[];
}

export interface ProjectDashboardData {
  summary: ProjectKpiSummary;
  charts: ProjectDashboardCharts;
  recentActivity: ProjectRecentActivity;
}

export interface ProjectDashboardApiResponse {
  success: boolean;
  message: string;
  data: ProjectDashboardData;
}

// ==================== TASK KPI MODELS ====================

export interface TaskKpiSummary {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  overdueTasks: number;
  tasksDueToday: number;
  tasksDueThisWeek: number;
  tasksCompletedToday: number;
  tasksCompletedYesterday: number;
  tasksCompletedTodayChangePercent: number;
  tasksCompletedThisWeek: number;
  tasksCompletedLastWeek: number;
  tasksCompletedThisWeekChangePercent: number;
  tasksCreatedThisMonth: number;
  tasksCreatedLastMonth: number;
  tasksCreatedMonthChangePercent: number;
  completionRate: number;
  averageCompletionTimeHours: number;
}

export interface TaskDashboardCharts {
  tasksByStatus: ChartStatusCount[];
  tasksByPriority: ChartPriorityCount[];
  tasksCreatedPerMonth: ChartMonthlyCount[];
  tasksCompletedPerMonth: ChartMonthlyCount[];
}

export interface RecentTask {
  id: string;
  projectId: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  createdAt: string;
  completedAt: string | null;
}

export interface TaskRecentActivity {
  recentlyCreated: RecentTask[];
  recentlyCompleted: RecentTask[];
}

export interface TaskDashboardData {
  summary: TaskKpiSummary;
  charts: TaskDashboardCharts;
  recentActivity: TaskRecentActivity;
}

export interface TaskDashboardApiResponse {
  success: boolean;
  message: string;
  data: TaskDashboardData;
}

// ==================== PROJECT-SPECIFIC TASK KPI MODELS ====================

export interface ProjectTaskKpiSummary {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
  cancelledTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTimeHours: number;
  averageTaskAgeHours: number;
  highPriorityTasks: number;
  urgentPriorityTasks: number;
  tasksDueToday: number;
  tasksDueThisWeek: number;
}

export interface TrendData {
  month: string;
  year: number;
  created: number;
  completed: number;
}

export interface ProjectTaskDashboardCharts {
  tasksByStatus: ChartStatusCount[];
  tasksByPriority: ChartPriorityCount[];
  tasksCreatedOverTime: ChartMonthlyCount[];
  tasksCompletedOverTime: ChartMonthlyCount[];
  completionTrend: TrendData[];
  assigneeWorkload: any[];
}

export interface ProjectTaskDashboardData {
  summary: ProjectTaskKpiSummary;
  charts: ProjectTaskDashboardCharts;
  recentActivity: TaskRecentActivity;
}

export interface ProjectTaskDashboardApiResponse {
  success: boolean;
  message: string;
  data: ProjectTaskDashboardData;
}
