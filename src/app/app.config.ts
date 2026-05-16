import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Store, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { ConfigService } from './core/config/config.service';
import { authReducer } from './core/auth/store/auth.reducer';
import { AuthEffects } from './core/auth/store/auth.effects';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { AuthService } from './core/auth/services/auth.service';
import { authInitSuccess, authInitFailure } from './core/auth/store/auth.actions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(async () => {
      // Angular requires all injections to happen synchronously before any await
      const configService = inject(ConfigService);
      const authService = inject(AuthService);
      const store = inject(Store);

      await configService.load();

      const isAuthenticated = await authService.initKeycloak();

      if (isAuthenticated) {
        const token = authService.getToken();
        const payload = authService.getParsedToken();
        if (token && payload) {
          store.dispatch(authInitSuccess({ token, payload }));
        }
      } else {
        store.dispatch(authInitFailure({ error: 'Not authenticated' }));
      }
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideStore({ auth: authReducer }),
    provideEffects([AuthEffects]),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false, // light mode only
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities'
          }
        }
      },
      ripple: true
    })
  ]
};
