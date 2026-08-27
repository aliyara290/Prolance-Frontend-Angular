import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noTenantGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasTenantId()) {
    console.log('[noTenantGuard] User already has a tenant, redirecting to dashboard');
    return router.parseUrl('/app/dashboard');
  }

  return true;
};
