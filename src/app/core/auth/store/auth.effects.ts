import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import * as AuthActions from './auth.actions';
import { UserApiService } from '../services/user-api.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly userApiService = inject(UserApiService);
  private readonly authService = inject(AuthService);

  // Load backend user after successful Keycloak auth
  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.authInitSuccess),
      switchMap(({ payload }) =>
        this.userApiService.getByKeycloakId(payload.sub).pipe(
          map(user => AuthActions.loadUserSuccess({ user })),
          catchError(error => of(AuthActions.loadUserFailure({ error: error.message })))
        )
      )
    )
  );

  // Trigger Keycloak logout when logout action is dispatched
  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => this.authService.logout())
      ),
    { dispatch: false }
  );
}
