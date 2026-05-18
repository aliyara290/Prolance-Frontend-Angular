export interface TokenPayload {
  sub: string;
  preferred_username: string;
  email: string;
  name: string;
  tenant_id?: string;
  tenantId?: string;
  realm_access: {
    roles: string[];
  };
  exp: number;
  iat: number;
}
