import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ConfigService } from '../../../core/config/config.service';
import {
  Milestone,
  MilestoneStatus,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
  ApiResponse,
} from '../../milestone/types/milestone.model';

@Injectable({ providedIn: 'root' })
export class ProjectMilestonesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private apiUrl(projectId: string): string {
    return `${this.config.value.apiGatewayUrl}/project/api/v1/projects/${projectId}/milestones`;
  }

  readonly milestones = signal<Milestone[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly totalCount = signal<number>(0);

  // ── Load all milestones for a project ──

  loadMilestones(projectId: string, page?: number, size?: number): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    params = params.set('size', size !== undefined ? size.toString() : '1000');

    this.http.get<ApiResponse<Milestone[]>>(this.apiUrl(projectId), { params }).subscribe({
      next: (res) => {
        const data = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
        this.milestones.set(data as Milestone[]);
        this.totalCount.set(res.meta?.totalElements ?? data.length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load project milestones', err);
        this.error.set('Failed to load milestones.');
        this.loading.set(false);
      },
    });
  }

  // ── Get single milestone ──

  getMilestone(projectId: string, milestoneId: string): Observable<ApiResponse<Milestone>> {
    return this.http.get<ApiResponse<Milestone>>(`${this.apiUrl(projectId)}/${milestoneId}`);
  }

  // ── Create milestone ──

  createMilestone(projectId: string, request: CreateMilestoneRequest): Observable<ApiResponse<Milestone>> {
    return this.http.post<ApiResponse<Milestone>>(this.apiUrl(projectId), request).pipe(
      tap((res) => {
        if (res.success) {
          this.milestones.update(list => [res.data, ...list]);
          this.totalCount.update(c => c + 1);
        }
      })
    );
  }

  // ── Update milestone (optimistic) ──

  updateMilestone(projectId: string, milestoneId: string, payload: UpdateMilestoneRequest): Observable<ApiResponse<Milestone>> {
    // Optimistic update
    this.milestones.update(list =>
      list.map(m => m.id === milestoneId ? { ...m, ...payload } as Milestone : m)
    );

    return this.http.put<ApiResponse<Milestone>>(`${this.apiUrl(projectId)}/${milestoneId}`, payload).pipe(
      tap((res) => {
        if (res.success) {
          this.milestones.update(list =>
            list.map(m => m.id === milestoneId ? res.data : m)
          );
        }
      })
    );
  }

  // ── Complete milestone (optimistic) ──

  completeMilestone(projectId: string, milestoneId: string): Observable<ApiResponse<Milestone>> {
    // Optimistic status change
    this.milestones.update(list =>
      list.map(m => m.id === milestoneId ? { ...m, status: 'COMPLETED' as MilestoneStatus } : m)
    );

    return this.http.put<ApiResponse<Milestone>>(`${this.apiUrl(projectId)}/${milestoneId}/complete`, {}).pipe(
      tap((res) => {
        if (res.success) {
          this.milestones.update(list =>
            list.map(m => m.id === milestoneId ? res.data : m)
          );
        }
      })
    );
  }

  // ── Delete milestone (optimistic) ──

  deleteMilestone(projectId: string, milestoneId: string): Observable<void> {
    // Optimistic delete
    this.milestones.update(list => list.filter(m => m.id !== milestoneId));
    this.totalCount.update(c => Math.max(0, c - 1));

    return this.http.delete<void>(`${this.apiUrl(projectId)}/${milestoneId}`);
  }

  // ── Revert status (for rollback on failure) ──

  revertMilestoneStatus(milestoneId: string, previousStatus: MilestoneStatus): void {
    this.milestones.update(list =>
      list.map(m => m.id === milestoneId ? { ...m, status: previousStatus } : m)
    );
  }

  // ── Clear state ──

  clear(): void {
    this.milestones.set([]);
    this.loading.set(false);
    this.error.set(null);
    this.totalCount.set(0);
  }
}
