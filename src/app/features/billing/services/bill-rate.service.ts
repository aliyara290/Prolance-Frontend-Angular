import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../core/config/config.service';
import {
  CreateBillRateRequest,
  UpdateBillRateRequest,
  BillRateResponse,
  BillRateApiResponse,
  BillRateListApiResponse,
} from '../types/bill-rate.types';
import { ApiResponse } from '../types/invoice.types';

@Injectable({ providedIn: 'root' })
export class BillRateService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get baseUrl(): string {
    return `${this.config.value.apiGatewayUrl}/billing/api/v1/bill-rates`;
  }

  createBillRate(request: CreateBillRateRequest): Observable<BillRateApiResponse> {
    return this.http.post<BillRateApiResponse>(this.baseUrl, request);
  }

  getBillRate(billRateId: string): Observable<BillRateApiResponse> {
    return this.http.get<BillRateApiResponse>(`${this.baseUrl}/${billRateId}`);
  }

  getBillRatesByProject(projectId: string): Observable<BillRateListApiResponse> {
    return this.http.get<BillRateListApiResponse>(`${this.baseUrl}/project/${projectId}`);
  }

  getBillRateByProjectAndUser(projectId: string, userId: string): Observable<BillRateApiResponse> {
    return this.http.get<BillRateApiResponse>(`${this.baseUrl}/project/${projectId}/user/${userId}`);
  }

  updateBillRate(billRateId: string, request: UpdateBillRateRequest): Observable<BillRateApiResponse> {
    return this.http.put<BillRateApiResponse>(`${this.baseUrl}/${billRateId}`, request);
  }

  deleteBillRate(billRateId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${billRateId}`);
  }
}
