import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../core/config/config.service';
import { TenantRegisterRequest, TenantRegisterResponse } from '../types/tenant-register.types';

@Injectable({
  providedIn: 'root'
})
export class TenantRegisterService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  register(request: TenantRegisterRequest): Observable<TenantRegisterResponse> {
    const baseUrl = this.configService.value.apiGatewayUrl;
    return this.http.post<TenantRegisterResponse>(
      `${baseUrl}/tenant/api/v1/tenants/register`,
      request
    );
  }
}
