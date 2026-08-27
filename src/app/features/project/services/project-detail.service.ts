import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../core/config/config.service';
import { Project, ProjectStatus, ProjectPriority } from '../types/project.model';
import { ProjectTaskDashboardData, ProjectTaskDashboardApiResponse } from '../types/dashboard.model';

interface SingleProjectResponse {
  success: boolean;
  data: Project;
}

@Injectable({ providedIn: 'root' })
export class ProjectDetailService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get apiUrl(): string {
    return `${this.config.value.apiGatewayUrl}/project/api/v1/projects`;
  }

  readonly project = signal<Project | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly dashboardData = signal<ProjectTaskDashboardData | null>(null);
  readonly loadingDashboard = signal<boolean>(false);
  readonly dashboardError = signal<string | null>(null);

  loadProject(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<SingleProjectResponse>(`${this.apiUrl}/${id}`).subscribe({
      next: (res) => {
        this.project.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load project details', err);
        this.error.set('Project not found or failed to load project details.');
        this.loading.set(false);
      },
    });
  }

  loadDashboardKpis(projectId: string): void {
    this.loadingDashboard.set(true);
    this.dashboardError.set(null);
    const url = `${this.config.value.apiGatewayUrl}/tasks/api/v1/tasks/project/${projectId}/kpis`;

    this.http.get<ProjectTaskDashboardApiResponse>(url).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.dashboardData.set(res.data);
        }
        this.loadingDashboard.set(false);
      },
      error: (err) => {
        console.error('Failed to load project dashboard KPIs', err);
        this.dashboardError.set('Failed to load dashboard data.');
        this.loadingDashboard.set(false);
      }
    });
  }

  readonly activities = signal<import('../types/project.model').ProjectActivity[]>([]);
  readonly loadingActivities = signal<boolean>(false);

  loadActivities(projectId: string): void {
    this.loadingActivities.set(true);
    this.http.get<import('../types/project.model').ProjectActivityResponse>(`${this.apiUrl}/${projectId}/activities`).subscribe({
      next: (res) => {
        if (res.success) {
          this.activities.set(res.data);
        }
        this.loadingActivities.set(false);
      },
      error: (err) => {
        console.error('Failed to load project activities', err);
        this.loadingActivities.set(false);
      }
    });
  }

  clear(): void {
    this.project.set(null);
    this.loading.set(true);
    this.error.set(null);
    this.dashboardData.set(null);
    this.loadingDashboard.set(false);
    this.dashboardError.set(null);
  }

  // ── Shared UI helpers (reused by layout + child pages) ──

  getStatusColor(status: ProjectStatus): string {
    const map: Record<ProjectStatus, string> = {
      PLANNED: 'var(--color-info)',
      ACTIVE: 'var(--color-success)',
      ON_HOLD: 'var(--color-warning)',
      COMPLETED: 'var(--color-text-muted)',
      CANCELLED: 'var(--color-danger)',
    };
    return map[status] ?? 'var(--color-text-muted)';
  }

  getStatusBg(status: ProjectStatus): string {
    const map: Record<ProjectStatus, string> = {
      PLANNED: 'var(--color-info)',
      ACTIVE: 'var(--color-success)',
      ON_HOLD: 'var(--color-warning)',
      COMPLETED: 'var(--color-text-muted)',
      CANCELLED: 'var(--color-danger)',
    };
    return map[status] ?? 'var(--color-bg-muted)';
  }

  getPriorityColor(priority: ProjectPriority): string {
    const map: Record<ProjectPriority, string> = {
      HIGH: 'var(--color-danger)',
      MEDIUM: 'var(--color-warning)',
      LOW: 'var(--color-success)',
    };
    return map[priority] ?? 'var(--color-text-muted)';
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return 'var(--color-success)';
    if (progress >= 40) return 'var(--color-warning)';
    return 'var(--color-primary)';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
