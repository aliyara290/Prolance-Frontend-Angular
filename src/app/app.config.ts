import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import {provideConfigInitializer} from './core/config/config.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideConfigInitializer(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
  ]
};
