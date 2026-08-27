import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ConfigService } from '../../../core/config/config.service';
import { UserApiService } from '../../../core/auth/services/user-api.service';
import { AuthUser } from '../../../core/auth/models/auth-user.model';
import { UsersStateService } from '../../tenant/settings/users/service/users-state.service';
import { WorkspaceUser, AVATAR_COLORS } from '../../tenant/settings/users/models/user.models';
import {
  TaskResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  ChangeTaskStatusRequest,
  TasksApiResponse,
  SingleTaskApiResponse,
  TasksListMeta,
} from '../types/task.model';

export interface UserDisplay {
  name: string;
  initials: string;
  avatarColor: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);
  private readonly userApiService = inject(UserApiService);
  private readonly usersStateService = inject(UsersStateService);

  private get apiUrl(): string {
    return `${this.config.value.apiGatewayUrl}/tasks/api/v1/tasks`;
  }

  readonly tasks = signal<TaskResponse[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly meta = signal<TasksListMeta | null>(null);
  readonly totalCount = signal<number>(0);

  private readonly userCacheMap = new Map<string, AuthUser>();
  readonly userCacheVersion = signal<number>(0);


  getUserDisplay(keycloakUserId: string | null | undefined): UserDisplay {
    if (!keycloakUserId) {
      return { name: 'Unassigned', initials: '?', avatarColor: '#94a3b8', email: '' };
    }

    const workspaceUser = this.usersStateService.usersList()
      .find((u: WorkspaceUser) => u.keycloakUserId === keycloakUserId);

    if (workspaceUser) {
      return {
        name: `${workspaceUser.firstName} ${workspaceUser.lastName}`,
        initials: `${workspaceUser.firstName.charAt(0)}${workspaceUser.lastName.charAt(0)}`.toUpperCase(),
        avatarColor: workspaceUser.avatarColor,
        email: workspaceUser.email,
      };
    }

    const cached = this.userCacheMap.get(keycloakUserId);
    if (cached) {
      return this.authUserToDisplay(cached);
    }

    this.fetchAndCacheUser(keycloakUserId);

    return { name: 'Loading...', initials: '..', avatarColor: '#94a3b8', email: '' };
  }

  private fetchAndCacheUser(keycloakUserId: string): void {
    if (this.userCacheMap.has(keycloakUserId)) return;

    this.userCacheMap.set(keycloakUserId, {
      id: keycloakUserId,
      keycloakUserId,
      tenantId: '',
      email: '',
      firstName: 'Loading',
      lastName: '...',
      jobTitle: null,
      department: null,
      status: 'ACTIVE',
      roles: [],
    });

    this.userApiService.getByKeycloakUserId(keycloakUserId).subscribe({
      next: (res) => {
        if (res.data) {
          this.userCacheMap.set(keycloakUserId, res.data);
          this.userCacheVersion.update(v => v + 1);
        }
      },
      error: () => {
      },
    });
  }

  private authUserToDisplay(user: AuthUser): UserDisplay {
    const hash = this.hashCode(user.id);
    return {
      name: `${user.firstName} ${user.lastName}`,
      initials: `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase(),
      avatarColor: AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length],
      email: user.email,
    };
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }


  loadTasks(projectId: string, page?: number, size?: number): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());

    this.http.get<TasksApiResponse>(`${this.apiUrl}/project/${projectId}`, { params }).subscribe({
      next: (res) => {
        const data = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
        this.tasks.set(data);
        this.meta.set(res.meta ?? null);
        this.totalCount.set(res.meta?.totalElements ?? data.length);
        this.loading.set(false);

        this.preResolveUserIds(data);
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.error.set('Failed to load tasks from the server.');
        this.loading.set(false);
      },
    });
  }

  loadAllTasks(page?: number, size?: number): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());

    this.http.get<TasksApiResponse>(this.apiUrl, { params }).subscribe({
      next: (res) => {
        const data = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
        this.tasks.set(data);
        this.meta.set(res.meta ?? null);
        this.totalCount.set(res.meta?.totalElements ?? data.length);
        this.loading.set(false);

        this.preResolveUserIds(data);
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.error.set('Failed to load tasks from the server.');
        this.loading.set(false);
      },
    });
  }

  getTasksByMilestone(milestoneId: string, page?: number, size?: number): Observable<TasksApiResponse> {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());

    return this.http.get<TasksApiResponse>(`${this.apiUrl}/milestone/${milestoneId}`, { params }).pipe(
      tap((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
        this.preResolveUserIds(data);
      })
    );
  }

  getTask(id: string): Observable<SingleTaskApiResponse> {
    return this.http.get<SingleTaskApiResponse>(`${this.apiUrl}/${id}`);
  }

  createTask(payload: CreateTaskRequest): Observable<SingleTaskApiResponse> {
    return this.http.post<SingleTaskApiResponse>(this.apiUrl, payload).pipe(
      tap((res) => {
        if (res.data) {
          this.tasks.update(tasks => [res.data, ...tasks]);
          this.totalCount.update(c => c + 1);
        }
      })
    );
  }

  updateTask(id: string, payload: UpdateTaskRequest): Observable<SingleTaskApiResponse> {
    return this.http.put<SingleTaskApiResponse>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((res) => {
        if (res.data) {
          this.tasks.update(tasks => tasks.map(t => t.id === id ? res.data : t));
        }
      })
    );
  }

  changeTaskStatus(id: string, payload: ChangeTaskStatusRequest): Observable<SingleTaskApiResponse> {
    return this.http.patch<SingleTaskApiResponse>(`${this.apiUrl}/${id}/status`, payload).pipe(
      tap((res) => {
        if (res.data) {
          this.tasks.update(tasks => tasks.map(t => t.id === id ? res.data : t));
        }
      })
    );
  }

  deleteTask(id: string): Observable<void> {
    this.tasks.update(tasks => tasks.filter(t => t.id !== id));
    this.totalCount.update(c => Math.max(0, c - 1));
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ── Helpers ──

  /**
   * Pre-resolves all user IDs found in task responses for eager caching.
   */
  private preResolveUserIds(tasks: TaskResponse[]): void {
    const userIds = new Set<string>();

    for (const task of tasks) {
      if (task.createdBy) userIds.add(task.createdBy);
      if (task.reporterId) userIds.add(task.reporterId);
      for (const assignment of task.assignments ?? []) {
        if (assignment.userId) userIds.add(assignment.userId);
      }
      for (const comment of task.comments ?? []) {
        if (comment.userId) userIds.add(comment.userId);
      }
    }

    // Trigger resolution for each unique user ID
    for (const userId of userIds) {
      this.getUserDisplay(userId);
    }
  }

  clear(): void {
    this.tasks.set([]);
    this.loading.set(false);
    this.error.set(null);
    this.meta.set(null);
    this.totalCount.set(0);
  }
}
