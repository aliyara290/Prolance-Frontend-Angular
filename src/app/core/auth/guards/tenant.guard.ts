import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const tenantGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const hasTenant = authService.hasTenantId();

  if (!hasTenant) {
    return router.parseUrl('/onboarding/company');
  }

  return true;
};
