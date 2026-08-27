import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ConfigService } from '../../../../core/config/config.service';
import { Deal, CreateDealRequest, UpdateDealRequest, DealsListMeta } from '../types/deal.model';

interface DealsResponse {
  success: boolean;
  data: Deal[];
  meta: DealsListMeta | null;
}

interface SingleDealResponse {
  success: boolean;
  data: Deal;
}

@Injectable({ providedIn: 'root' })
export class DealsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get apiUrl(): string {
    return `${this.config.value.apiGatewayUrl}/crm/api/v1/opportunities`;
  }

  readonly deals = signal<Deal[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly totalCount = signal<number>(0);
  readonly meta = signal<DealsListMeta | null>(null);

  loadDeals(page?: number, size?: number, title?: string): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());
    if (title) params = params.set('title', title);

    this.http.get<DealsResponse>(this.apiUrl, { params }).subscribe({
      next: (res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
        this.deals.set(data);
        this.meta.set(res.meta);
        this.totalCount.set(res.meta?.totalElements ?? data.length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load deals', err);
        this.error.set('Failed to load deals from the server.');
        this.loading.set(false);
      }
    });
  }

  getDeals(): Observable<{ success: boolean; data: Deal[] }> {
    return this.http.get<{ success: boolean; data: Deal[] }>(this.apiUrl);
  }

  getDeal(id: string): Observable<SingleDealResponse> {
    return this.http.get<SingleDealResponse>(`${this.apiUrl}/${id}`);
  }

  createDeal(request: CreateDealRequest): Observable<SingleDealResponse> {
    return this.http.post<SingleDealResponse>(this.apiUrl, request).pipe(
      tap(() => this.loadDeals())
    );
  }

  updateDeal(id: string, payload: UpdateDealRequest): Observable<SingleDealResponse> {
    return this.http.put<SingleDealResponse>(`${this.apiUrl}/${id}`, payload).pipe(
      tap(() => this.loadDeals())
    );
  }

  deleteDeal(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadDeals())
    );
  }
}
