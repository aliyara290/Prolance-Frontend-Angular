
export interface AuthUser {
  id: string;
  keycloakUserId: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  department: string | null;
  status: string;
  roles: string[];
}

export interface AuthUserResponse {
  data: AuthUser;
}
