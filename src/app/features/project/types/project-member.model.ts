export type MemberRole = 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'REMOVED';

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  allocationPercentage: number;
  status: MemberStatus;
  joinedAt: string;
  leftAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AddMemberRequest {
  userId: string;
  role: MemberRole;
  allocationPercentage: number;
  status: MemberStatus;
}

export interface UpdateMemberRequest {
  role: MemberRole;
  allocationPercentage: number;
  status: MemberStatus;
}

export interface MemberResponse {
  success: boolean;
  data: ProjectMember;
  meta: null;
  timestamp: string;
}

export interface MembersListResponse {
  success: boolean;
  data: ProjectMember[];
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

export const ALL_MEMBER_ROLES: MemberRole[] = ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'];
export const ALL_MEMBER_STATUSES: MemberStatus[] = ['ACTIVE', 'INACTIVE', 'REMOVED'];

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

export const MEMBER_STATUS_COLORS: Record<MemberStatus, string> = {
  ACTIVE: 'var(--color-success)',
  INACTIVE: 'var(--color-warning)',
  REMOVED: 'var(--color-danger)',
};

export const MEMBER_ROLE_COLORS: Record<MemberRole, string> = {
  OWNER: 'var(--color-primary)',
  MANAGER: 'var(--color-info)',
  MEMBER: 'var(--color-success)',
  VIEWER: 'var(--color-text-muted)',
};
