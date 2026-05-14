import { createReducer, on } from '@ngrx/store';
import { initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,
  
  on(AuthActions.authInitSuccess, (state, { token, payload }) => ({
    ...state,
    isAuthenticated: true,
    accessToken: token,
    roles: payload.realm_access?.roles || [],
    loading: true,
    error: null
  })),

  on(AuthActions.authInitFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    accessToken: null,
    roles: [],
    loading: false,
    error
  })),

  on(AuthActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null
  })),

  on(AuthActions.loadUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(AuthActions.logout, () => initialAuthState)
);
