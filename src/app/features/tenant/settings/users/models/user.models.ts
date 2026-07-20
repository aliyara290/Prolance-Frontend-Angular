export type UserRole = 'ADMIN' | 'MEMBER' | 'VIEWER' | 'PROJECT_MANAGER' | 'ACCOUNTANT' | 'SALES';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'DEACTIVATED';

export interface BackendUser {
  id: string;
  tenantId: string;
  keycloakUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  department: string | null;
  status: UserStatus;
  lastLoginAt: string | null;
  keycloakRoleGroupIds: string[];
}

export interface WorkspaceUser {
  id: string;
  keycloakUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  department?: string;
  roles: UserRole[];
  status: UserStatus;
  avatarColor: string;
  lastLoginAt: string | null;
  keycloakRoleGroupIds: string[];
}

export interface CreateUserPayload {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  roles: UserRole[];
  jobTitle?: string;
  department?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } | null;
  timestamp: string;
}

export const ALL_ROLES: UserRole[] = [
  'ADMIN', 'MEMBER', 'VIEWER', 'PROJECT_MANAGER', 'ACCOUNTANT', 'SALES'
];

export const ALL_DEPARTMENTS = [
  'TECHNOLOGY', 'FINANCE', 'HEALTHCARE', 'EDUCATION', 'MANUFACTURING',
  'CONSULTING', 'MEDIA', 'REAL_ESTATE', 'TRANSPORTATION', 'ENERGY',
  'AGRICULTURE', 'RETAIL', 'OTHER'
];

export const AVATAR_COLORS = [
  '#267af7', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6',
  '#0ea5e9', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
];
