import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../core/config/config.service';
import { ProjectDashboardApiResponse, ProjectDashboardData, TaskDashboardApiResponse, TaskDashboardData } from '../types/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  readonly projectKpis = signal<ProjectDashboardData | null>(null);
  readonly taskKpis = signal<TaskDashboardData | null>(null);
  readonly loadingProjects = signal<boolean>(false);
  readonly loadingTasks = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadProjectDashboardKpis(): void {
    this.loadingProjects.set(true);
    this.error.set(null);
    const url = `${this.config.value.apiGatewayUrl}/project/api/v1/projects/dashboard/kpis`;

    this.http.get<ProjectDashboardApiResponse>(url).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.projectKpis.set(res.data);
        }
        this.loadingProjects.set(false);
      },
      error: (err) => {
        console.error('Failed to load project KPIs', err);
        this.error.set('Failed to load project dashboard data.');
        this.loadingProjects.set(false);
      }
    });
  }

  loadTaskDashboardKpis(): void {
    this.loadingTasks.set(true);
    this.error.set(null);
    const url = `${this.config.value.apiGatewayUrl}/tasks/api/v1/tasks/dashboard/kpis`;

    this.http.get<TaskDashboardApiResponse>(url).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.taskKpis.set(res.data);
        }
        this.loadingTasks.set(false);
      },
      error: (err) => {
        console.error('Failed to load task KPIs', err);
        this.error.set('Failed to load task dashboard data.');
        this.loadingTasks.set(false);
      }
    });
  }
}
