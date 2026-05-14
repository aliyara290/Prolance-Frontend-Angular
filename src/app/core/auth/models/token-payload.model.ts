export interface TokenPayload {
  sub: string;
  preferred_username: string;
  email: string;
  realm_access: {
    roles: string[];
  };
  exp: number;
  iat: number;
}
