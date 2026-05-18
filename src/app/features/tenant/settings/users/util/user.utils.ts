import { UserRole, UserStatus, WorkspaceUser } from '../models/user.models';

export function getInitials(user: WorkspaceUser): string {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
}

export function getRoleLabel(role: UserRole): string {
  return role.replace('_', ' ');
}

export function getRoleBadgeClass(role: UserRole): string {
  const map: Record<UserRole, string> = {
    ADMIN:           'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
    MEMBER:          'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
    VIEWER:          'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]',
    PROJECT_MANAGER: 'bg-[var(--color-info-soft)] text-[var(--color-info)]',
    ACCOUNTANT:      'bg-[var(--color-success-soft)] text-[var(--color-success)]',
    SALES:           'bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
  };
  return map[role];
}

export function getStatusDotClass(status: UserStatus): string {
  const map: Record<UserStatus, string> = {
    active:      'bg-[var(--color-success)]',
    invited:     'bg-[var(--color-warning)]',
    deactivated: 'bg-[var(--color-bar-bg)]',
  };
  return map[status];
}
