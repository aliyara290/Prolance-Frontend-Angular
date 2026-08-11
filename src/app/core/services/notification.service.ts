import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ConfigService } from '../config/config.service';

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  category: string;
  icon: string;
  entityType: string;
  entityId: string;
  actionUrl: string;
  readStatus: 'UNREAD' | 'READ';
  createdAt: string;
  readAt: string | null;
}

export interface UnreadCountResponse {
  count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  // Global state for unread count
  unreadCount = signal<number>(0);

  getNotifications(page: number = 0, size: number = 20): Observable<PaginatedResponse<NotificationResponse>> {
    const apiUrl = this.configService.value.apiGatewayUrl;
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<NotificationResponse>>(`${apiUrl}/notification/api/v1/notifications`, { params });
  }

  fetchUnreadCount(): Observable<{ data: UnreadCountResponse }> {
    const apiUrl = this.configService.value.apiGatewayUrl;
    return this.http.get<{ data: UnreadCountResponse }>(`${apiUrl}/notification/api/v1/notifications/unread-count`)
      .pipe(
        tap(res => {
          if (res && res.data) {
            this.unreadCount.set(res.data.count);
          }
        })
      );
  }

  markAsRead(id: string): Observable<any> {
    const apiUrl = this.configService.value.apiGatewayUrl;
    return this.http.put(`${apiUrl}/notification/api/v1/notifications/${id}/read`, {}).pipe(
      tap(() => {
        // Optimistically decrement count
        this.unreadCount.update(c => Math.max(0, c - 1));
      })
    );
  }

  markAllAsRead(): Observable<any> {
    const apiUrl = this.configService.value.apiGatewayUrl;
    return this.http.put(`${apiUrl}/notification/api/v1/notifications/read-all`, {}).pipe(
      tap(() => {
        this.unreadCount.set(0);
      })
    );
  }
}
