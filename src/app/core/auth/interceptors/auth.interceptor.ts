import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Skip interceptor for local assets (like config.json)
  if (req.url.startsWith('assets/')) {
    return next(req);
  }

  return from(authService.updateToken(30)).pipe(
    switchMap(() => {
      const token = authService.getToken();

      if (token) {
        const clonedReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(clonedReq);
      }

      return next(req);
    })
  );
};