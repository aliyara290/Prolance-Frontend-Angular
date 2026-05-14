import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectAuthRoles } from '../store/auth.selectors';

export const roleGuard: CanActivateFn = (route) => {
  const store = inject(Store);
  const router = inject(Router);
  
  const expectedRoles = route.data['roles'] as string[];

  if (!expectedRoles || expectedRoles.length === 0) {
    return true; // No roles required
  }

  return store.select(selectAuthRoles).pipe(
    take(1),
    map(userRoles => {
      const hasRole = expectedRoles.some(role => userRoles.includes(role));
      if (!hasRole) {
        return router.parseUrl('/403'); // Replace with your forbidden route or handle appropriately
      }
      return true;
    })
  );
};
