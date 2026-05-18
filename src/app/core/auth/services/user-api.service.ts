import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthUser, AuthUserResponse} from '../models/auth-user.model';
import { ConfigService } from '../../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  getByKeycloakId(): Observable<AuthUserResponse> {
    const apiUrl = this.configService.value.apiGatewayUrl;
    return this.http.get<AuthUserResponse>(`${apiUrl}/tenant/api/v1/tenants/users/byKeycloakId`);
  }
}

