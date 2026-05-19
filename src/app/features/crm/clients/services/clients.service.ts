import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../../core/config/config.service';
import { Client, CreateClientRequest } from '../types/client.model';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get apiUrl(): string {
    return `${this.config.value.apiGatewayUrl}/crm/api/v1/clients`;
  }

  getClients(): Observable<{ success: boolean; data: Client[] }> {
    return this.http.get<{ success: boolean; data: Client[] }>(this.apiUrl);
  }

  createClient(request: CreateClientRequest): Observable<{ success: boolean; data: Client }> {
    return this.http.post<{ success: boolean; data: Client }>(this.apiUrl, request);
  }
}
