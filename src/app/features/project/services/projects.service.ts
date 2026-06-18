import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ConfigService } from '../../../core/config/config.service';
import {
  Project,
  ProjectStatus,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectsListMeta, ProjectsNamesResponse, ProjectsNames
} from '../types/project.model';

interface ProjectsResponse {
  success: boolean;
  data: Project[];
  meta: ProjectsListMeta | null;
}

interface SingleProjectResponse {
  success: boolean;
  data: Project;
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get apiUrl(): string {
    return `${this.config.value.apiGatewayUrl}/project/api/v1/projects`;
  }

  readonly projects = signal<Project[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly totalCount = signal<number>(0);
  readonly meta = signal<ProjectsListMeta | null>(null);
  readonly projectNames = signal<ProjectsNames[]>([]);

  loadProjectNames(): void {
    this.getProjectsNames().subscribe({
      next: (res) => {
        if (res.success) {
          this.projectNames.set(res.data);
        }
      }
    });
  }

  loadProjects(page?: number, size?: number, name?: string): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());
    if (name) params = params.set('name', name);

    this.http.get<ProjectsResponse>(this.apiUrl, { params }).subscribe({
      next: (res) => {
        const data = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
        this.projects.set(data);
        this.meta.set(res.meta);
        this.totalCount.set(res.meta?.totalElements ?? data.length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load projects', err);
        this.error.set('Failed to load projects from the server.');
        this.loading.set(false);
      },
    });
  }

  getProjectsNames(): Observable<ProjectsNamesResponse> {
    return this.http.get<ProjectsNamesResponse>(`${this.apiUrl}/names`);
  }

  getProject(id: string): Observable<SingleProjectResponse> {
    return this.http.get<SingleProjectResponse>(`${this.apiUrl}/${id}`);
  }

  createProject(request: CreateProjectRequest): Observable<SingleProjectResponse> {
    return this.http.post<SingleProjectResponse>(this.apiUrl, request).pipe(
      tap((res) => {
        this.projects.update(projects => [res.data, ...projects]);
        this.loadProjectNames();
      })
    );
  }

  updateProject(id: string, payload: UpdateProjectRequest): Observable<SingleProjectResponse> {
    // Optimistic update
    this.projects.update(projects => projects.map(p => p.id === id ? { ...p, ...payload } as Project : p));

    return this.http.put<SingleProjectResponse>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((res) => {
        this.projects.update(projects => projects.map(p => p.id === id ? res.data : p));
        this.loadProjectNames();
      })
    );
  }

  /** Reverts a project's status in local state — used to roll back optimistic updates on API failure. */
  revertProjectStatus(id: string, previousStatus: ProjectStatus): void {
    this.projects.update(projects =>
      projects.map(p => p.id === id ? { ...p, status: previousStatus } : p)
    );
  }

  deleteProject(id: string): Observable<{ success: boolean }> {
    // Optimistic delete
    this.projects.update(projects => projects.filter(p => p.id !== id));
    
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.loadProjectNames();
      })
    );
  }
}
