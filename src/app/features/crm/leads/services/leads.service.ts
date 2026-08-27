import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ConfigService } from '../../../../core/config/config.service';
import { Lead, CreateLeadRequest } from '../types/lead.model';

interface LeadsResponse {
  success: boolean;
  data: Lead[];
  meta: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } | null;
}

interface SingleLeadResponse {
  success: boolean;
  data: Lead;
}

@Injectable({ providedIn: 'root' })
export class LeadsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get apiUrl(): string {
    return `${this.config.value.apiGatewayUrl}/crm/api/v1/leads`;
  }

  readonly leads = signal<Lead[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly totalCount = signal<number>(0);

  loadLeads(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<LeadsResponse>(this.apiUrl).subscribe({
      next: (res) => {
        this.leads.set(res.data || []);
        this.totalCount.set(res.meta?.totalElements ?? res.data?.length ?? 0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load leads', err);
        this.error.set('Failed to load leads from the server.');
        this.loading.set(false);
      }
    });
  }

  getLead(id: string): Observable<SingleLeadResponse> {
    return this.http.get<SingleLeadResponse>(`${this.apiUrl}/${id}`);
  }

  createLead(payload: CreateLeadRequest): Observable<SingleLeadResponse> {
    return this.http.post<SingleLeadResponse>(this.apiUrl, payload).pipe(
      tap(() => this.loadLeads())
    );
  }

  updateLead(id: string, payload: Partial<Lead>): Observable<SingleLeadResponse> {
    return this.http.put<SingleLeadResponse>(`${this.apiUrl}/${id}`, payload).pipe(
      tap(() => this.loadLeads())
    );
  }

  deleteLead(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadLeads())
    );
  }

  convertToDeal(id: string): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(`${this.apiUrl}/${id}/convert`, {});
  }
}
