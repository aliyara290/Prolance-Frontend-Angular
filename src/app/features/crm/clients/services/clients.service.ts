import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ConfigService } from '../../../../core/config/config.service';
import { Client, CreateClientRequest, UpdateClientRequest, ClientsListMeta } from '../types/client.model';

interface ClientsResponse {
  success: boolean;
  data: Client[];
  meta: ClientsListMeta | null;
}

interface SingleClientResponse {
  success: boolean;
  data: Client;
}

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get apiUrl(): string {
    return `${this.config.value.apiGatewayUrl}/crm/api/v1/clients`;
  }

  readonly clients = signal<Client[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly totalCount = signal<number>(0);
  readonly meta = signal<ClientsListMeta | null>(null);

  loadClients(page?: number, size?: number, name?: string): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());
    if (name) params = params.set('name', name);

    this.http.get<ClientsResponse>(this.apiUrl, { params }).subscribe({
      next: (res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
        this.clients.set(data);
        this.meta.set(res.meta);
        this.totalCount.set(res.meta?.totalElements ?? data.length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load clients', err);
        this.error.set('Failed to load clients from the server.');
        this.loading.set(false);
      }
    });
  }

  getClients(): Observable<{ success: boolean; data: Client[] }> {
    return this.http.get<{ success: boolean; data: Client[] }>(this.apiUrl);
  }

  getClient(id: string): Observable<SingleClientResponse> {
    return this.http.get<SingleClientResponse>(`${this.apiUrl}/${id}`);
  }

  createClient(request: CreateClientRequest): Observable<SingleClientResponse> {
    return this.http.post<SingleClientResponse>(this.apiUrl, request).pipe(
      tap(() => this.loadClients())
    );
  }

  updateClient(id: string, payload: UpdateClientRequest): Observable<SingleClientResponse> {
    return this.http.put<SingleClientResponse>(`${this.apiUrl}/${id}`, payload).pipe(
      tap(() => this.loadClients())
    );
  }

  deleteClient(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadClients())
    );
  }
}
