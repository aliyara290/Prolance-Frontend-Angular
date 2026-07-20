import { Component, OnInit, inject, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Target, CheckCircle2, Clock, AlertCircle, ArrowUpRight, ArrowDownRight, Plus, Activity, MoreHorizontal } from 'lucide-angular';
import { DashboardService } from '../../services/dashboard.service';
import { ChartModule } from 'primeng/chart';
import { DashboardSkeletonComponent } from '../../../../shared/ui/skeletons/dashboard-skeleton/dashboard-skeleton.component';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-project-dashboard-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ChartModule, DashboardSkeletonComponent, RouterLink],
  templateUrl: './project-dashboard-page.component.html'
})
export class ProjectDashboardPageComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly projectKpis = this.dashboardService.projectKpis;
  readonly taskKpis = this.dashboardService.taskKpis;
  readonly loadingProjects = this.dashboardService.loadingProjects;
  readonly loadingTasks = this.dashboardService.loadingTasks;

  icons = {
    target: Target,
    check: CheckCircle2,
    clock: Clock,
    alert: AlertCircle,
    up: ArrowUpRight,
    down: ArrowDownRight,
    plus: Plus,
    activity: Activity,
    more: MoreHorizontal
  };

  // Chart Data
  projectsByStatusData: any;
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
      const pData = this.projectKpis();
      const tData = this.taskKpis();

      if (pData || tData) {
        this.initOptions();
      }

      if (pData) {
        this.initProjectsByStatusChart(pData.charts.projectsByStatus);
      }

      if (tData) {
        this.initTasksByStatusChart(tData.charts.tasksByStatus);
        this.initTasksByPriorityChart(tData.charts.tasksByPriority);
      }

      if (pData && tData) {
        this.initMonthlyTrendChart(pData.charts.projectsCreatedPerMonth, tData.charts.tasksCreatedPerMonth);
      }

      this.cdr.markForCheck();
    });
  }

  private initOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--color-text-muted').trim() || '#64748b';
    const gridColor = documentStyle.getPropertyValue('--color-border').trim() || '#e2e8f0';

    this.doughnutOptions = {
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor, usePointStyle: false, font: { size: 12 } } }
      },
      cutout: '65%',
      maintainAspectRatio: false
    };

    this.barOptions = {
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true, font: { size: 12 } } }
      },
      scales: {
        x: { ticks: { color: textColor, font: { size: 11 } }, grid: { display: false }, border: { display: false } },
        y: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: gridColor, drawBorder: false }, border: { display: false } }
      },
      maintainAspectRatio: false
    };
  }

  ngOnInit(): void {
    this.dashboardService.loadProjectDashboardKpis();
    this.dashboardService.loadTaskDashboardKpis();
  }

  private initProjectsByStatusChart(data: any[]): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const getStatusColor = (status: string) => {
      const map: Record<string, string> = {
        PLANNED: documentStyle.getPropertyValue('--color-info') || '#0ea5e9',
        ACTIVE: documentStyle.getPropertyValue('--color-primary') || '#3b82f6',
        ON_HOLD: documentStyle.getPropertyValue('--color-warning') || '#f59e0b',
        COMPLETED: documentStyle.getPropertyValue('--color-success') || '#10b981',
        CANCELLED: documentStyle.getPropertyValue('--color-danger') || '#ef4444',
      };
      return map[status] || '#94a3b8';
    };

    const allStatuses = ['PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
    const mergedData = allStatuses.map(status => {
      const existing = data.find(d => d.status === status);
      return { status, count: existing ? existing.count : 0 };
    });

    this.projectsByStatusData = {
      labels: mergedData.map(d => d.status.replace('_', ' ')),
      datasets: [
        {
          data: mergedData.map(d => d.count),
          backgroundColor: mergedData.map(d => getStatusColor(d.status)),
          borderWidth: 1,
          borderColor: documentStyle.getPropertyValue('--color-bg') || '#ffffff',
          hoverOffset: 2
        }
      ]
    };
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
          borderWidth: 1,
          borderColor: documentStyle.getPropertyValue('--color-bg') || '#ffffff',
          hoverOffset: 2
        }
      ]
    };
  }

  private initTasksByPriorityChart(data: any[]): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const getPriorityColor = (priority: string) => {
      const map: Record<string, string> = {
        LOW: documentStyle.getPropertyValue('--color-info') || '#0ea5e9',
        MEDIUM: documentStyle.getPropertyValue('--color-warning') || '#f59e0b',
        HIGH: documentStyle.getPropertyValue('--color-primary') || '#3b82f6',
        URGENT: documentStyle.getPropertyValue('--color-danger') || '#ef4444',
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
          borderWidth: 1,
          borderColor: documentStyle.getPropertyValue('--color-bg') || '#ffffff',
          hoverOffset: 2
        }
      ]
    };
  }

  private initMonthlyTrendChart(projCreated: any[], tasksCreated: any[]): void {
    const documentStyle = getComputedStyle(document.documentElement);

    const allMonths = Array.from(new Set([...projCreated.map(p => p.month.trim()), ...tasksCreated.map(t => t.month.trim())]));

    const pCounts = allMonths.map(m => projCreated.find(p => p.month.trim() === m)?.count || 0);
    const tCounts = allMonths.map(m => tasksCreated.find(t => t.month.trim() === m)?.count || 0);

    this.monthlyTrendData = {
      labels: allMonths,
      datasets: [
        {
          label: 'Projects',
          backgroundColor: documentStyle.getPropertyValue('--color-primary') || '#3b82f6',
          data: pCounts,
          borderRadius: 4,
          maxBarThickness: 40
        },
        {
          label: 'Tasks',
          backgroundColor: documentStyle.getPropertyValue('--color-border-strong') || '#cbd5e1',
          data: tCounts,
          borderRadius: 4,
          maxBarThickness: 40
        }
      ]
    };
  }
}
