import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../core/config/config.service';
import { Observable } from 'rxjs';
import { TimeEntry, Invoice, LogTimeRequest, GenerateInvoiceRequest } from '../models/billing.models';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  private get baseUrl(): string {
    return `${this.configService.value.apiGatewayUrl}/billing/api/v1/billing`;
  }

  // --- Time Tracking ---
  
  logTime(request: LogTimeRequest): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(`${this.baseUrl}/time-entries/log`, request);
  }

  getTimeEntriesByProject(projectId: string): Observable<TimeEntry[]> {
    return this.http.get<TimeEntry[]>(`${this.baseUrl}/time-entries/project/${projectId}`);
  }

  getTimeEntriesByUser(userId: string): Observable<TimeEntry[]> {
    return this.http.get<TimeEntry[]>(`${this.baseUrl}/time-entries/user/${userId}`);
  }

  // --- Invoicing ---

  generateInvoice(request: GenerateInvoiceRequest): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.baseUrl}/invoices/generate`, request);
  }

  getInvoicesByProject(projectId: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.baseUrl}/invoices/project/${projectId}`);
  }

  getInvoiceById(invoiceId: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.baseUrl}/invoices/${invoiceId}`);
  }
}
