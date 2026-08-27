import { createAction, props } from '@ngrx/store';
import { AuthUser } from '../models/auth-user.model';
import { TokenPayload } from '../models/token-payload.model';

export const authInitSuccess = createAction(
  '[Auth] Init Success',
  props<{ token: string; payload: TokenPayload }>()
);

export const authInitFailure = createAction(
  '[Auth] Init Failure',
  props<{ error: string }>()
);

export const loadUserSuccess = createAction(
  '[Auth API] Load User Success',
  props<{ user: AuthUser }>()
);

export const loadUserFailure = createAction(
  '[Auth API] Load User Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');
