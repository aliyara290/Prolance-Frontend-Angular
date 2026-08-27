import { Component, OnInit, inject, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmDashboardService } from '../services/crm-dashboard.service';
import { ChartModule } from 'primeng/chart';
import { DashboardSkeletonComponent } from '../../../../shared/ui/skeletons/dashboard-skeleton/dashboard-skeleton.component';
import { ErrorMessageComponent } from '../../../../shared/ui/error-message/error-message.component';
import { LucideAngularModule, Users, UserPlus, FileText, CheckCircle, Activity, Briefcase, TrendingUp, Plus } from 'lucide-angular';
import { DashboardData, ChartEntry, TimeSeriesEntry, RecentActivity } from '../types/dashboard.models';

@Component({
  selector: 'app-crm-dashboard-page',
  standalone: true,
  imports: [CommonModule, ChartModule, DashboardSkeletonComponent, ErrorMessageComponent, LucideAngularModule],
  templateUrl: './crm-dashboard-page.component.html'
})
export class CrmDashboardPageComponent implements OnInit {
  private readonly dashboardService = inject(CrmDashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly dashboardData = this.dashboardService.dashboardData;
  readonly isLoading = this.dashboardService.isLoading;
  readonly error = this.dashboardService.error;

  icons = {
    users: Users,
    userPlus: UserPlus,
    fileText: FileText,
    checkCircle: CheckCircle,
    activity: Activity,
    briefcase: Briefcase,
    trendingUp: TrendingUp,
    plus: Plus
  };

  // Chart Data
  leadsByStatusData: any;
  dealsByStageData: any;
  wonVsLostDealsData: any;
  pipelineValueData: any;

  // Chart Options
  doughnutOptions: any;
  barOptions: any;
  lineOptions: any;
  pieOptions: any;

  constructor() {
    effect(() => {
      const data = this.dashboardData();
      
      if (data) {
        this.initOptions();
        this.initCharts(data);
      }
      
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.dashboardService.loadDashboard();
  }

  private initOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--color-text-inve').trim() || '#B2B2B2';
    const gridColor = documentStyle.getPropertyValue('--color-border').trim() || '#e2e8f0';

    const commonLegend = {
      position: 'bottom',
      labels: { color: textColor, usePointStyle: true }
    };

    this.doughnutOptions = {
      plugins: { legend: commonLegend },
      cutout: '70%',
      maintainAspectRatio: false
    };

    this.pieOptions = {
      plugins: { legend: commonLegend },
      maintainAspectRatio: false
    };

    this.barOptions = {
      plugins: { legend: { display: false } }, // Usually bar charts don't need legend if one dataset
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      },
      maintainAspectRatio: false
    };

    this.lineOptions = {
      plugins: { legend: commonLegend },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      },
      maintainAspectRatio: false
    };
  }

  private initCharts(data: DashboardData): void {
    const documentStyle = getComputedStyle(document.documentElement);
    
    // Theme colors
    const colors = [
      documentStyle.getPropertyValue('--color-primary') || '#3b82f6',
      documentStyle.getPropertyValue('--color-success') || '#10b981',
      documentStyle.getPropertyValue('--color-warning') || '#f59e0b',
      documentStyle.getPropertyValue('--color-info') || '#0ea5e9',
      documentStyle.getPropertyValue('--color-danger') || '#ef4444',
      documentStyle.getPropertyValue('--color-accent') || '#8b5cf6',
      '#94a3b8'
    ];

    // 1. Leads by Status (Doughnut Chart)
    if (data.charts?.leadsByStatus) {
      this.leadsByStatusData = {
        labels: data.charts.leadsByStatus.map((d: ChartEntry) => d.label.replace('_', ' ')),
        datasets: [{
          data: data.charts.leadsByStatus.map((d: ChartEntry) => d.value),
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      };
    }

    // 2. Deals by Stage (Pie Chart)
    if (data.charts?.dealsByStage) {
      this.dealsByStageData = {
        labels: data.charts.dealsByStage.map((d: ChartEntry) => d.label.replace('_', ' ')),
        datasets: [{
          data: data.charts.dealsByStage.map((d: ChartEntry) => d.value),
          backgroundColor: colors.slice().reverse(), // just for visual variation
          borderWidth: 0,
          hoverOffset: 4
        }]
      };
    }

    // 3. Won vs Lost Deals (Doughnut Chart)
    if (data.charts?.wonVsLost) {
      this.wonVsLostDealsData = {
        labels: data.charts.wonVsLost.map((d: ChartEntry) => d.label.replace('_', ' ')),
        datasets: [{
          data: data.charts.wonVsLost.map((d: ChartEntry) => d.value),
          backgroundColor: [
            documentStyle.getPropertyValue('--color-success') || '#10b981',
            documentStyle.getPropertyValue('--color-danger') || '#ef4444'
          ],
          borderWidth: 0,
          hoverOffset: 4
        }]
      };
    }

    // 4. Pipeline Value by Stage (Bar Chart)
    if (data.charts?.pipelineValueByStage) {
      this.pipelineValueData = {
        labels: data.charts.pipelineValueByStage.map((d: ChartEntry) => d.label.replace('_', ' ')),
        datasets: [{
          label: 'Pipeline Value',
          data: data.charts.pipelineValueByStage.map((d: ChartEntry) => d.value),
          backgroundColor: documentStyle.getPropertyValue('--color-primary') || '#3b82f6',
          borderRadius: 4,
          maxBarThickness: 40
        }]
      };
    }
  }

  getIconForActivity(entityType: string) {
    switch(entityType.toUpperCase()) {
      case 'LEAD': return this.icons.users;
      case 'OPPORTUNITY': return this.icons.briefcase;
      case 'CLIENT': return this.icons.checkCircle;
      case 'CONTACT': return this.icons.userPlus;
      default: return this.icons.activity;
    }
  }

  getColorForActivity(action: string) {
    switch(action.toUpperCase()) {
      case 'CREATE': return 'bg-[var(--color-success)] text-white';
      case 'UPDATE': return 'bg-[var(--color-info)] text-white';
      case 'DELETE': return 'bg-[var(--color-danger)] text-white';
      default: return 'bg-[var(--color-primary)] text-white';
    }
  }

  getBadgeClassForActivity(action: string) {
    switch(action.toUpperCase()) {
      case 'CREATE': return 'bg-[var(--color-success-muted)] text-[var(--color-success)] border border-[var(--color-success-border)]';
      case 'UPDATE': return 'bg-[var(--color-info-muted)] text-[var(--color-info)] border border-[var(--color-info-border)]';
      case 'DELETE': return 'bg-[var(--color-danger-muted)] text-[var(--color-danger)] border border-[var(--color-danger-border)]';
      default: return 'bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary-border)]';
    }
  }
}
