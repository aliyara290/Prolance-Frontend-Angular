import { UserRole, UserStatus, WorkspaceUser } from '../models/user.models';

export function getInitials(user: WorkspaceUser): string {
  const f = user.firstName ? user.firstName[0] : '';
  const l = user.lastName ? user.lastName[0] : '';
  return `${f}${l}`.toUpperCase() || 'U';
}

export function getRoleLabel(role: UserRole): string {
  return role ? role.replace('_', ' ') : '';
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
  return map[role] || 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]';
}

export function getStatusDotClass(status: UserStatus): string {
  const map: Record<UserStatus, string> = {
    ACTIVE:      'bg-[var(--color-success)]',
    PENDING:     'bg-[var(--color-warning)]',
    DEACTIVATED: 'bg-[var(--color-bar-bg)]',
  };
  return map[status] || 'bg-[var(--color-bar-bg)]';
}
