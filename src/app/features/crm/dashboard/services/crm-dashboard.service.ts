import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../../core/config/config.service';
import { DashboardData, DashboardResponse } from '../types/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class CrmDashboardService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get apiUrl(): string {
    return `${this.config.value.apiGatewayUrl}/crm/api/v1/crm/dashboard`;
  }

  // State signals
  readonly dashboardData = signal<DashboardData | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadDashboard(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<DashboardResponse>(this.apiUrl).subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboardData.set(res.data);
        } else {
          this.error.set('Failed to load dashboard data');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'An error occurred while loading the dashboard');
        this.isLoading.set(false);
      }
    });
  }
}
