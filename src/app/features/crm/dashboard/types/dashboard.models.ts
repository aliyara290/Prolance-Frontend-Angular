export interface ChartEntry {
  label: string;
  value: number;
}

export interface TimeSeriesEntry {
  year: number;
  month: number;
  count: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  message: string;
  entityType: string;
  createdAt: string;
}

export interface CrmKpis {
  totalLeads: number;
  leadConversionRate: number;
  openDeals: number;
  wonDeals: number;
  totalPipelineValue: number;
  totalClients: number;
  newClientsThisMonth: number;
  totalContacts: number;
  recentActivities: RecentActivity[];
}

export interface CrmCharts {
  leadsByStatus: ChartEntry[];
  leadsByMonth: TimeSeriesEntry[];
  dealsByStage: ChartEntry[];
  wonVsLost: ChartEntry[];
  pipelineValueByStage: ChartEntry[];
  clientsByMonth: TimeSeriesEntry[];
}

export interface DashboardData {
  kpis: CrmKpis;
  charts: CrmCharts;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  meta: any;
  timestamp: string;
}
