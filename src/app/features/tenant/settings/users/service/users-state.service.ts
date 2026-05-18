import { Injectable, signal, computed } from '@angular/core';
import {
  WorkspaceUser, CreateUserPayload, UserStatus,
  AVATAR_COLORS
} from '../models/user.models';

const MOCK_USERS: WorkspaceUser[] = [
  {
    id: '1',
    username: 'ali.yara',
    email: 'ali.yara.fr@gmail.com',
    firstName: 'Ali',
    lastName: 'Yara',
    jobTitle: 'CEO',
    department: 'TECHNOLOGY',
    roles: ['ADMIN'],
    status: 'active',
    avatarColor: '#267af7',
    joinedAt: 'Jan 5, 2024',
    lastActive: '2 minutes ago',
  },
  {
    id: '2',
    username: 'hiba.yara',
    email: 'contact@aliyara.com',
    firstName: 'Hiba',
    lastName: 'Yara',
    jobTitle: 'Manager',
    department: 'CONSULTING',
    roles: ['MEMBER', 'PROJECT_MANAGER'],
    status: 'active',
    avatarColor: '#16a34a',
    joinedAt: 'Feb 12, 2024',
    lastActive: '1 hour ago',
  },
  {
    id: '3',
    username: 'sara.chen',
    email: 'sara.chen@inovsmart.com',
    firstName: 'Sara',
    lastName: 'Chen',
    jobTitle: 'Sales Lead',
    department: 'RETAIL',
    roles: ['SALES'],
    status: 'invited',
    avatarColor: '#f59e0b',
    joinedAt: 'May 16, 2025',
  },
  {
    id: '4',
    username: 'karim.nasri',
    email: 'k.nasri@inovsmart.com',
    firstName: 'Karim',
    lastName: 'Nasri',
    jobTitle: 'Finance Analyst',
    department: 'FINANCE',
    roles: ['ACCOUNTANT', 'VIEWER'],
    status: 'active',
    avatarColor: '#8b5cf6',
    joinedAt: 'Mar 3, 2024',
    lastActive: 'Yesterday',
  },
  {
    id: '5',
    username: 'lena.frost',
    email: 'lena.f@inovsmart.com',
    firstName: 'Lena',
    lastName: 'Frost',
    jobTitle: 'Designer',
    department: 'MEDIA',
    roles: ['MEMBER'],
    status: 'deactivated',
    avatarColor: '#ec4899',
    joinedAt: 'Nov 20, 2023',
  },
];

@Injectable({ providedIn: 'root' })
export class UsersStateService {
  private _users = signal<WorkspaceUser[]>(MOCK_USERS);
  private _selectedUserId = signal<string | null>("1");
  private _activeTab = signal<UserStatus>('active');
  private _searchQuery = signal('');
  private _isDark = signal(false);

  // ── Public read-only signals ──
  readonly isDark = this._isDark.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();

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
        u.username.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  });

  readonly tabCounts = computed(() => ({
    active:      this._users().filter(u => u.status === 'active').length,
    invited:     this._users().filter(u => u.status === 'invited').length,
    deactivated: this._users().filter(u => u.status === 'deactivated').length,
  }));

  // ── Actions ──
  toggleDark(): void {
    this._isDark.update(v => !v);
  }

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

  createUser(payload: CreateUserPayload): void {
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const newUser: WorkspaceUser = {
      id: Date.now().toString(),
      ...payload,
      status: 'invited',
      avatarColor: color,
      joinedAt: new Date().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      }),
    };
    this._users.update(u => [...u, newUser]);
    this._activeTab.set('invited');
    this._selectedUserId.set(null);
  }

  deactivateUser(id: string): void {
    this._users.update(us =>
      us.map(u => u.id === id ? { ...u, status: 'deactivated' } : u)
    );
    this._selectedUserId.set(null);
    this._activeTab.set('deactivated');
  }

  reactivateUser(id: string): void {
    this._users.update(us =>
      us.map(u => u.id === id ? { ...u, status: 'active' } : u)
    );
    this._selectedUserId.set(null);
    this._activeTab.set('active');
  }

  deleteUser(id: string): void {
    this._users.update(us => us.filter(u => u.id !== id));
    this._selectedUserId.set(null);
  }
}
