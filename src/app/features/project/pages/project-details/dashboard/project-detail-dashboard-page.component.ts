import { Component, OnInit, inject, effect, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Target, CheckCircle2, Clock, AlertCircle, ArrowUpRight, ArrowDownRight, Plus, Activity } from 'lucide-angular';
import { ProjectDetailService } from '../../../services/project-detail.service';
import { ChartModule } from 'primeng/chart';
import { DashboardSkeletonComponent } from '../../../../../shared/ui/skeletons/dashboard-skeleton/dashboard-skeleton.component';

@Component({
  selector: 'app-project-detail-dashboard-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ChartModule, DashboardSkeletonComponent, RouterModule],
  templateUrl: './project-detail-dashboard-page.component.html',
})
export class ProjectDetailDashboardPageComponent implements OnInit {
  readonly detailService = inject(ProjectDetailService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);

  readonly dashboardData = this.detailService.dashboardData;
  readonly loadingDashboard = this.detailService.loadingDashboard;

  icons = {
    target: Target,
    check: CheckCircle2,
    clock: Clock,
    alert: AlertCircle,
    up: ArrowUpRight,
    down: ArrowDownRight,
    plus: Plus,
    activity: Activity
  };

  // Chart Data
  tasksByStatusData: any;
  tasksByPriorityData: any;
  monthlyTrendData: any;

  // Chart Options
  doughnutOptions: any;
  barOptions: any;



  get Math() {
    return Math;
  }

  constructor() {
    effect(() => {
      const data = this.dashboardData();

      if (data) {
        this.initOptions();
        this.initTasksByStatusChart(data.charts.tasksByStatus);
        this.initTasksByPriorityChart(data.charts.tasksByPriority);
        this.initMonthlyTrendChart(data.charts.tasksCreatedOverTime, data.charts.tasksCompletedOverTime);
      }
      
      this.cdr.markForCheck();
    });

    this.route.parent?.paramMap.pipe(takeUntilDestroyed()).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.detailService.loadDashboardKpis(id);
      }
    });
  }

  private initOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--color-text').trim() || '#121320';
    const gridColor = documentStyle.getPropertyValue('--color-border').trim() || '#e2e8f0';

    this.doughnutOptions = {
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true } }
      },
      cutout: '70%',
      maintainAspectRatio: false
    };

    this.barOptions = {
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor } }
      },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      },
      maintainAspectRatio: false
    };
  }

  ngOnInit(): void {
  }

  private initTasksByStatusChart(data: any[]): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const getTaskStatusColor = (status: string) => {
      const map: Record<string, string> = {
        TODO: documentStyle.getPropertyValue('--color-border-strong') || '#cbd5e1',
        IN_PROGRESS: documentStyle.getPropertyValue('--color-primary') || '#3b82f6',
        IN_REVIEW: documentStyle.getPropertyValue('--color-warning') || '#f59e0b',
        DONE: documentStyle.getPropertyValue('--color-success') || '#10b981',
        CANCELLED: documentStyle.getPropertyValue('--color-danger') || '#ef4444',
      };
      return map[status] || '#94a3b8';
    };

    const allStatuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'];
    const mergedData = allStatuses.map(status => {
      const existing = data.find(d => d.status === status);
      return { status, count: existing ? existing.count : 0 };
    });

    this.tasksByStatusData = {
      labels: mergedData.map(d => d.status.replace('_', ' ')),
      datasets: [
        {
          data: mergedData.map(d => d.count),
          backgroundColor: mergedData.map(d => getTaskStatusColor(d.status)),
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    };
  }

  private initTasksByPriorityChart(data: any[]): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const getPriorityColor = (priority: string) => {
      const map: Record<string, string> = {
        LOW: documentStyle.getPropertyValue('--color-success') || '#10b981',
        MEDIUM: documentStyle.getPropertyValue('--color-warning') || '#f59e0b',
        HIGH: documentStyle.getPropertyValue('--color-danger') || '#ef4444',
        URGENT: documentStyle.getPropertyValue('--color-danger-strong') || '#dc2626',
      };
      return map[priority] || '#94a3b8';
    };

    const allPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const mergedData = allPriorities.map(priority => {
      const existing = data.find(d => d.priority === priority);
      return { priority, count: existing ? existing.count : 0 };
    });

    this.tasksByPriorityData = {
      labels: mergedData.map(d => d.priority),
      datasets: [
        {
          data: mergedData.map(d => d.count),
          backgroundColor: mergedData.map(d => getPriorityColor(d.priority)),
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    };
  }

  private initMonthlyTrendChart(createdOverTime: any[], completedOverTime: any[]): void {
    const documentStyle = getComputedStyle(document.documentElement);
    
    const allMonths = Array.from(new Set([...createdOverTime.map(p => p.month.trim()), ...completedOverTime.map(t => t.month.trim())]));
    
    const cCounts = allMonths.map(m => createdOverTime.find(p => p.month.trim() === m)?.count || 0);
    const dCounts = allMonths.map(m => completedOverTime.find(t => t.month.trim() === m)?.count || 0);

    this.monthlyTrendData = {
      labels: allMonths,
      datasets: [
        {
          label: 'Tasks Created',
          backgroundColor: documentStyle.getPropertyValue('--color-primary') || '#3b82f6',
          data: cCounts,
          borderRadius: 4,
          maxBarThickness: 40
        },
        {
          label: 'Tasks Completed',
          backgroundColor: documentStyle.getPropertyValue('--color-success') || '#10b981',
          data: dCounts,
          borderRadius: 4,
          maxBarThickness: 40
        }
      ]
    };
  }
}
