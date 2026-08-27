import { AuthUser } from '../models/auth-user.model';

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: AuthUser | null;
  roles: string[];
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  user: null,
  roles: [],
  loading: false,
  error: null
};
