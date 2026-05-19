import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../../../core/config/config.service';
import { AuthService } from '../../../../../core/auth/services/auth.service';
import {
  WorkspaceUser, BackendUser, CreateUserPayload, UserStatus, UserRole,
  ApiResponse, AVATAR_COLORS, ALL_ROLES
} from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UsersStateService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);
  private readonly authService = inject(AuthService);

  // ── Signals ──
  private _users = signal<WorkspaceUser[]>([]);
  private _selectedUserId = signal<string | null>(null);
  private _activeTab = signal<UserStatus>('ACTIVE');
  private _searchQuery = signal('');
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  // ── Persistent Role Group Map (UUID -> Role) ──
  private roleGroupMap = new Map<string, UserRole>();

  // ── Public read-only signals ──
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly usersList = this._users.asReadonly();

  readonly selectedUser = computed(() =>
    this._users().find(u => u.id === this._selectedUserId()) ?? null
  );

  readonly filteredUsers = computed(() => {
    const q = this._searchQuery().toLowerCase();
    const tab = this._activeTab();
    return this._users().filter(u => {
      const matchTab = u.status === tab;
      const matchSearch =
        !q ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.jobTitle?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  });

  readonly tabCounts = computed(() => ({
    ACTIVE:      this._users().filter(u => u.status === 'ACTIVE').length,
    PENDING:     this._users().filter(u => u.status === 'PENDING').length,
    DEACTIVATED: this._users().filter(u => u.status === 'DEACTIVATED').length,
  }));

  constructor() {
    this.loadRoleGroupMap();
    this.loadUsers();
  }

  // ── Loaders & Persisters ──
  private loadRoleGroupMap(): void {
    try {
      const stored = localStorage.getItem('prolance_role_group_map');
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([id, role]) => {
          this.roleGroupMap.set(id, role as UserRole);
        });
      }
    } catch (e) {
      console.error('Failed to load role group map', e);
    }
  }

  private saveRoleGroupMap(): void {
    try {
      const obj = Object.fromEntries(this.roleGroupMap.entries());
      localStorage.setItem('prolance_role_group_map', JSON.stringify(obj));
    } catch (e) {
      console.error('Failed to save role group map', e);
    }
  }

  // ── Actions ──
  setTab(tab: UserStatus): void {
    this._activeTab.set(tab);
    this._selectedUserId.set(null);
  }

  setSearch(q: string): void {
    this._searchQuery.set(q);
  }

  selectUser(id: string): void {
    this._selectedUserId.set(id);
  }

  clearSelection(): void {
    this._selectedUserId.set(null);
  }

  // ── HTTP API Calls ──
  loadUsers(): void {
    this._isLoading.set(true);
    this._error.set(null);
    const apiUrl = `${this.configService.value.apiGatewayUrl}/tenant/api/v1/tenants/users`;

    this.http.get<ApiResponse<BackendUser[]>>(apiUrl).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const mapped = res.data.map(u => this.mapBackendUser(u));
          this._users.set(mapped);
        }
        this._isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this._error.set(err.error?.message || err.message || 'Failed to fetch users from backend');
        this._isLoading.set(false);
      }
    });
  }

  createUser(payload: CreateUserPayload): void {
    this._isLoading.set(true);
    this._error.set(null);
    const apiUrl = `${this.configService.value.apiGatewayUrl}/tenant/api/v1/tenants/users`;

    this.http.post<ApiResponse<BackendUser>>(apiUrl, payload).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Dynamic Self-Learning Role Group Map Integration
          if (payload.roles.length > 0 && res.data.keycloakRoleGroupIds?.length > 0) {
            payload.roles.forEach((r, idx) => {
              const groupId = res.data.keycloakRoleGroupIds[idx] || res.data.keycloakRoleGroupIds[0];
              this.roleGroupMap.set(groupId, r);
            });
            this.saveRoleGroupMap();
          }
          this.loadUsers();
          this._activeTab.set('PENDING');
          this._selectedUserId.set(res.data.id);
        }
        this._isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to invite user', err);
        this._error.set(err.error?.message || err.message || 'Failed to invite user');
        this._isLoading.set(false);
      }
    });
  }

  deactivateUser(id: string): void {
    this._isLoading.set(true);
    this._error.set(null);
    const apiUrl = `${this.configService.value.apiGatewayUrl}/tenant/api/v1/tenants/users/${id}/deactivate`;

    this.http.delete<ApiResponse<void>>(apiUrl).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadUsers();
          this._selectedUserId.set(null);
          this._activeTab.set('DEACTIVATED');
        }
        this._isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to deactivate user', err);
        this._error.set(err.error?.message || err.message || 'Failed to deactivate user');
        this._isLoading.set(false);
      }
    });
  }

  reactivateUser(id: string): void {
    this._isLoading.set(true);
    this._error.set(null);
    const apiUrl = `${this.configService.value.apiGatewayUrl}/tenant/api/v1/tenants/users/${id}/activate`;

    this.http.post<ApiResponse<void>>(apiUrl, {}).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadUsers();
          this._selectedUserId.set(null);
          this._activeTab.set('ACTIVE');
        }
        this._isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to activate user', err);
        this._error.set(err.error?.message || err.message || 'Failed to activate user');
        this._isLoading.set(false);
      }
    });
  }

  addUserRole(id: string, role: UserRole): void {
    this._isLoading.set(true);
    this._error.set(null);
    const apiUrl = `${this.configService.value.apiGatewayUrl}/tenant/api/v1/tenants/users/${id}/roles`;

    this.http.post<ApiResponse<BackendUser>>(apiUrl, { role }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Identify the new role group ID added
          const oldUser = this._users().find(u => u.id === id);
          const oldGroupIds = oldUser?.keycloakRoleGroupIds || [];
          const newGroupId = res.data.keycloakRoleGroupIds.find(gid => !oldGroupIds.includes(gid));
          if (newGroupId) {
            this.roleGroupMap.set(newGroupId, role);
            this.saveRoleGroupMap();
          }
          this.loadUsers();
        }
        this._isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to add role', err);
        this._error.set(err.error?.message || err.message || 'Failed to add role');
        this._isLoading.set(false);
      }
    });
  }

  removeUserRole(id: string, role: UserRole): void {
    this._isLoading.set(true);
    this._error.set(null);
    const apiUrl = `${this.configService.value.apiGatewayUrl}/tenant/api/v1/tenants/users/${id}/roles`;

    this.http.delete<ApiResponse<BackendUser>>(apiUrl, { body: { role } }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Identify the role group ID removed
          const oldUser = this._users().find(u => u.id === id);
          const oldGroupIds = oldUser?.keycloakRoleGroupIds || [];
          const removedGroupId = oldGroupIds.find(gid => !res.data.keycloakRoleGroupIds.includes(gid));
          if (removedGroupId) {
            this.roleGroupMap.set(removedGroupId, role);
            this.saveRoleGroupMap();
          }
          this.loadUsers();
        }
        this._isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to remove role', err);
        this._error.set(err.error?.message || err.message || 'Failed to remove role');
        this._isLoading.set(false);
      }
    });
  }

  // ── Mapping Helper ──
  private mapBackendUser(u: BackendUser): WorkspaceUser {
    const roles: UserRole[] = [];
    u.keycloakRoleGroupIds.forEach(id => {
      const role = this.roleGroupMap.get(id);
      if (role) {
        roles.push(role);
      }
    });

    // Self-learning mapping from currently logged-in user context
    if (roles.length === 0) {
      const currentUserEmail = this.authService.getParsedToken()?.email;
      if (currentUserEmail && u.email.toLowerCase() === currentUserEmail.toLowerCase()) {
        const parsedRoles = this.authService.getParsedToken()?.realm_access?.roles || [];
        parsedRoles.forEach((r: string) => {
          const matched = ALL_ROLES.find(ar => ar === r.toUpperCase());
          if (matched) {
            roles.push(matched);
            u.keycloakRoleGroupIds.forEach(id => {
              this.roleGroupMap.set(id, matched);
            });
          }
        });
        if (roles.length > 0) {
          this.saveRoleGroupMap();
        }
      }
    }

    // Default fallback to MEMBER if still not resolved
    if (roles.length === 0) {
      roles.push('MEMBER');
    }

    const color = AVATAR_COLORS[Math.abs(this.hashCode(u.id)) % AVATAR_COLORS.length];

    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      jobTitle: u.jobTitle || undefined,
      department: u.department || undefined,
      status: u.status,
      avatarColor: color,
      lastLoginAt: u.lastLoginAt,
      roles: Array.from(new Set(roles)),
      keycloakRoleGroupIds: u.keycloakRoleGroupIds
    };
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }
}
