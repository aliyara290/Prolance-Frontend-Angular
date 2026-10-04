import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideAppInitializer, inject, ErrorHandler, Injectable } from '@angular/core';
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

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // Angular sometimes wraps errors. We need to check all possible properties.
    const errorMessage = 
      error?.message || 
      error?.rejection?.message || 
      error?.originalError?.message || 
      error?.toString() || 
      '';
      
    const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error));
    
    // Check if the error is a chunk loading error (e.g. after a new deployment)
    const isChunkLoadError = 
      /Loading chunk/i.test(errorMessage) || 
      /Failed to fetch dynamically imported module/i.test(errorMessage) ||
      /Expected a JavaScript-or-Wasm module script/i.test(errorMessage) ||
      /Loading chunk/i.test(errorString) || 
      /Failed to fetch dynamically imported module/i.test(errorString) ||
      /Expected a JavaScript-or-Wasm module script/i.test(errorString);

    if (isChunkLoadError) {
      console.warn('Chunk load error detected (new deployment). Reloading page...');
      window.location.href = window.location.href.split('#')[0]; // force reload without hash
      window.location.reload();
      return;
    }

    // Default error logging
    console.error('An error occurred:', error);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
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
