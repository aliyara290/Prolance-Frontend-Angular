import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ConfigService } from '../../../core/config/config.service';
import {
  ProjectMember,
  AddMemberRequest,
  UpdateMemberRequest,
  MemberResponse,
  MembersListResponse,
  MemberStatus,
} from '../types/project-member.model';

@Injectable({ providedIn: 'root' })
export class ProjectMembersService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private apiUrl(projectId: string): string {
    return `${this.config.value.apiGatewayUrl}/project/api/v1/projects/${projectId}/members`;
  }

  readonly members = signal<ProjectMember[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal<number>(0);

  readonly activeMembers = computed(() =>
    this.members().filter(m => m.status === 'ACTIVE')
  );

  readonly membersByRole = computed(() => {
    const list = this.members();
    return {
      owners: list.filter(m => m.role === 'OWNER'),
      managers: list.filter(m => m.role === 'MANAGER'),
      members: list.filter(m => m.role === 'MEMBER'),
      viewers: list.filter(m => m.role === 'VIEWER'),
    };
  });

  loadMembers(projectId: string, page?: number, size?: number): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());

    this.http.get<MembersListResponse>(this.apiUrl(projectId), { params }).subscribe({
      next: (res) => {
        if (res.success) {
          this.members.set(res.data);
          this.totalElements.set(res.meta?.totalElements ?? res.data.length);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load project members', err);
        this.error.set('Failed to load project members.');
        this.loading.set(false);
      },
    });
  }

  addMember(projectId: string, request: AddMemberRequest): Observable<MemberResponse> {
    return this.http.post<MemberResponse>(this.apiUrl(projectId), request).pipe(
      tap((res) => {
        if (res.success) {
          this.members.update(members => [...members, res.data]);
        }
      })
    );
  }

  updateMember(projectId: string, userId: string, request: UpdateMemberRequest): Observable<MemberResponse> {
    // Optimistic update
    this.members.update(members =>
      members.map(m => m.userId === userId ? { ...m, ...request } as ProjectMember : m)
    );

    return this.http.put<MemberResponse>(`${this.apiUrl(projectId)}/${userId}`, request).pipe(
      tap((res) => {
        if (res.success) {
          this.members.update(members =>
            members.map(m => m.userId === userId ? res.data : m)
          );
        }
      })
    );
  }

  removeMember(projectId: string, userId: string): Observable<void> {
    // Optimistic delete
    this.members.update(members => members.filter(m => m.userId !== userId));

    return this.http.delete<void>(`${this.apiUrl(projectId)}/${userId}`);
  }

  clear(): void {
    this.members.set([]);
    this.loading.set(false);
    this.error.set(null);
    this.totalElements.set(0);
  }
}
