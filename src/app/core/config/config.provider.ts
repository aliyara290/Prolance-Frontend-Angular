import { provideAppInitializer, inject } from '@angular/core';
import { ConfigService } from './config.service';

export const provideConfigInitializer = () =>
  provideAppInitializer(async () => {
    await inject(ConfigService).load();
  });
