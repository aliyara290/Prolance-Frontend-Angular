import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ConfigService } from '../../../core/config/config.service';
import {
  Milestone,
  MilestoneStatus,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
  MilestoneStatistics,
  ApiResponse
} from '../types/milestone.model';

@Injectable({ providedIn: 'root' })
export class MilestoneService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get baseMilestoneUrl(): string {
    return `${this.config.value.apiGatewayUrl}/project/api/v1/milestones`;
  }

  private get baseProjectUrl(): string {
    return `${this.config.value.apiGatewayUrl}/project/api/v1/projects`;
  }

  // Global State for UI
  readonly milestones = signal<Milestone[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly totalCount = signal<number>(0);

  // --- Global Milestones Endpoints ---

  loadAllMilestones(page?: number, size?: number, sort?: string): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());
    if (sort) params = params.set('sort', sort);

    this.http.get<ApiResponse<Milestone[]>>(this.baseMilestoneUrl, { params }).subscribe({
      next: (res) => {
        const data = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
        this.milestones.set(data as Milestone[]);
        this.totalCount.set(res.meta?.totalElements ?? data.length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load milestones', err);
        this.error.set('Failed to load milestones from the server.');
        this.loading.set(false);
      },
    });
  }

  loadMilestonesByProject(projectId: string, page?: number, size?: number): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());

    this.http.get<ApiResponse<Milestone[]>>(`${this.baseProjectUrl}/${projectId}/milestones`, { params }).subscribe({
      next: (res) => {
        const data = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
        this.milestones.set(data as Milestone[]);
        this.totalCount.set(res.meta?.totalElements ?? data.length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load project milestones', err);
        this.error.set('Failed to load project milestones from the server.');
        this.loading.set(false);
      },
    });
  }

  getMilestonesByStatus(status: string, page?: number, size?: number): Observable<ApiResponse<Milestone[]>> {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());
    return this.http.get<ApiResponse<Milestone[]>>(`${this.baseMilestoneUrl}/status/${status}`, { params });
  }

  getUpcomingMilestones(): Observable<ApiResponse<Milestone[]>> {
    return this.http.get<ApiResponse<Milestone[]>>(`${this.baseMilestoneUrl}/upcoming`);
  }

  getOverdueMilestones(): Observable<ApiResponse<Milestone[]>> {
    return this.http.get<ApiResponse<Milestone[]>>(`${this.baseMilestoneUrl}/overdue`);
  }

  getStatistics(): Observable<ApiResponse<MilestoneStatistics>> {
    return this.http.get<ApiResponse<MilestoneStatistics>>(`${this.baseMilestoneUrl}/statistics`);
  }

  // --- Project Specific Endpoints ---

  getProjectMilestones(projectId: string, page?: number, size?: number): Observable<ApiResponse<Milestone[]>> {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());
    return this.http.get<ApiResponse<Milestone[]>>(`${this.baseProjectUrl}/${projectId}/milestones`, { params });
  }

  getMilestone(projectId: string, milestoneId: string): Observable<ApiResponse<Milestone>> {
    return this.http.get<ApiResponse<Milestone>>(`${this.baseProjectUrl}/${projectId}/milestones/${milestoneId}`);
  }

  createMilestone(projectId: string, request: CreateMilestoneRequest): Observable<ApiResponse<Milestone>> {
    return this.http.post<ApiResponse<Milestone>>(`${this.baseProjectUrl}/${projectId}/milestones`, request).pipe(
      tap(() => this.loadAllMilestones())
    );
  }

  updateMilestone(projectId: string, milestoneId: string, payload: UpdateMilestoneRequest): Observable<ApiResponse<Milestone>> {
    // Optimistic update — apply change immediately in local state without a full reload
    this.milestones.update(list =>
      list.map(m => m.id === milestoneId ? { ...m, ...payload } as Milestone : m)
    );

    return this.http.put<ApiResponse<Milestone>>(`${this.baseProjectUrl}/${projectId}/milestones/${milestoneId}`, payload).pipe(
      tap((res) => {
        // Sync with the confirmed server response
        this.milestones.update(list =>
          list.map(m => m.id === milestoneId ? res.data : m)
        );
      })
    );
  }

  /** Reverts a milestone's status in local state — used to roll back optimistic updates on API failure. */
  revertMilestoneStatus(milestoneId: string, previousStatus: MilestoneStatus): void {
    this.milestones.update(list =>
      list.map(m => m.id === milestoneId ? { ...m, status: previousStatus } : m)
    );
  }

  completeMilestone(projectId: string, milestoneId: string): Observable<ApiResponse<Milestone>> {
    return this.http.put<ApiResponse<Milestone>>(`${this.baseProjectUrl}/${projectId}/milestones/${milestoneId}/complete`, {}).pipe(
      tap(() => this.loadAllMilestones())
    );
  }

  deleteMilestone(projectId: string, milestoneId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseProjectUrl}/${projectId}/milestones/${milestoneId}`).pipe(
      tap(() => this.loadAllMilestones())
    );
  }
}
