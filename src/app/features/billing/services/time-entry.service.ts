import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../core/config/config.service';
import { LogTimeRequest, TimeEntryResponse } from '../types/time-entry.types';

/**
 * Time tracking API client.
 * Note: Time tracking endpoints return DTOs directly, NOT wrapped in ApiResponse.
 */
@Injectable({ providedIn: 'root' })
export class TimeEntryService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get baseUrl(): string {
    return `${this.config.value.apiGatewayUrl}/billing/api/v1/time-entries`;
  }

  logTime(request: LogTimeRequest): Observable<TimeEntryResponse> {
    return this.http.post<TimeEntryResponse>(this.baseUrl, request);
  }

  updateTimeEntry(id: string, request: LogTimeRequest): Observable<TimeEntryResponse> {
    return this.http.put<TimeEntryResponse>(`${this.baseUrl}/${id}`, request);
  }

  deleteTimeEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getTimeEntriesByProject(projectId: string, start: string, end: string): Observable<TimeEntryResponse[]> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);
    return this.http.get<TimeEntryResponse[]>(`${this.baseUrl}/project/${projectId}`, { params });
  }
}
