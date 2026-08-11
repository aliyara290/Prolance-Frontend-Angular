import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../../../../../core/config/config.service';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface TenantResDTO {
  id: string;
  name: string;
  email: string;
  website: string;
  size: number;
  foundedDate: string;
  description: string;
  logo: string;
  industry: string;
  status: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

export interface UpdateTenantReqDTO {
  name: string;
  website: string;
  description: string;
  logo: string;
  size: number;
  foundedDate: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  getWorkspace(tenantId: string): Observable<TenantResDTO> {
    const baseUrl = this.configService.value.apiGatewayUrl;
    return this.http.get<ApiResponse<TenantResDTO>>(`${baseUrl}/tenant/api/v1/tenants/${tenantId}`).pipe(
      map(res => res.data)
    );
  }

  updateWorkspace(tenantId: string, request: UpdateTenantReqDTO): Observable<TenantResDTO> {
    const baseUrl = this.configService.value.apiGatewayUrl;
    return this.http.put<ApiResponse<TenantResDTO>>(`${baseUrl}/tenant/api/v1/tenants/${tenantId}`, request).pipe(
      map(res => res.data)
    );
  }
}
