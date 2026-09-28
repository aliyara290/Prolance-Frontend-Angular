import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../core/config/config.service';
import {
  ApiResponse,
  PageResponse,
  CreateInvoiceRequest,
  GenerateInvoiceRequest,
  UpdateInvoiceRequest,
  AddLineItemRequest,
  UpdateLineItemRequest,
  InvoiceResponse,
  InvoiceSummaryResponse,
} from '../types/invoice.types';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get baseUrl(): string {
    return `${this.config.value.apiGatewayUrl}/billing/api/v1/invoices`;
  }


  createInvoice(request: CreateInvoiceRequest): Observable<ApiResponse<InvoiceResponse>> {
    return this.http.post<ApiResponse<InvoiceResponse>>(this.baseUrl, request);
  }

  generateInvoice(request: GenerateInvoiceRequest): Observable<ApiResponse<InvoiceResponse>> {
    return this.http.post<ApiResponse<InvoiceResponse>>(`${this.baseUrl}/generate`, request);
  }


  getInvoice(invoiceId: string): Observable<ApiResponse<InvoiceResponse>> {
    return this.http.get<ApiResponse<InvoiceResponse>>(`${this.baseUrl}/${invoiceId}`);
  }

  getInvoices(page: number = 0, size: number = 20, sort?: string): Observable<PageResponse<InvoiceSummaryResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<PageResponse<InvoiceSummaryResponse>>(this.baseUrl, { params });
  }

  getInvoicesByProject(projectId: string, page: number = 0, size: number = 20): Observable<PageResponse<InvoiceSummaryResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<InvoiceSummaryResponse>>(`${this.baseUrl}/project/${projectId}`, { params });
  }

  getInvoicesByClient(clientId: string, page: number = 0, size: number = 20): Observable<PageResponse<InvoiceSummaryResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<InvoiceSummaryResponse>>(`${this.baseUrl}/client/${clientId}`, { params });
  }


  updateInvoice(invoiceId: string, request: UpdateInvoiceRequest): Observable<ApiResponse<InvoiceResponse>> {
    return this.http.put<ApiResponse<InvoiceResponse>>(`${this.baseUrl}/${invoiceId}`, request);
  }


  addLineItem(invoiceId: string, request: AddLineItemRequest): Observable<ApiResponse<InvoiceResponse>> {
    return this.http.post<ApiResponse<InvoiceResponse>>(`${this.baseUrl}/${invoiceId}/line-items`, request);
  }

  updateLineItem(invoiceId: string, lineItemId: string, request: UpdateLineItemRequest): Observable<ApiResponse<InvoiceResponse>> {
    return this.http.put<ApiResponse<InvoiceResponse>>(`${this.baseUrl}/${invoiceId}/line-items/${lineItemId}`, request);
  }

  deleteLineItem(invoiceId: string, lineItemId: string): Observable<ApiResponse<InvoiceResponse>> {
    return this.http.delete<ApiResponse<InvoiceResponse>>(`${this.baseUrl}/${invoiceId}/line-items/${lineItemId}`);
  }


  sendInvoice(invoiceId: string): Observable<ApiResponse<InvoiceResponse>> {
    return this.http.post<ApiResponse<InvoiceResponse>>(`${this.baseUrl}/${invoiceId}/send`, null);
  }

  payInvoice(invoiceId: string, comment?: string): Observable<ApiResponse<InvoiceResponse>> {
    let params = new HttpParams();
    if (comment) {
      params = params.set('comment', comment);
    }
    return this.http.post<ApiResponse<InvoiceResponse>>(`${this.baseUrl}/${invoiceId}/pay`, null, { params });
  }

  partialPayInvoice(invoiceId: string, comment?: string): Observable<ApiResponse<InvoiceResponse>> {
    let params = new HttpParams();
    if (comment) {
      params = params.set('comment', comment);
    }
    return this.http.post<ApiResponse<InvoiceResponse>>(`${this.baseUrl}/${invoiceId}/partial-pay`, null, { params });
  }

  cancelInvoice(invoiceId: string, reason?: string): Observable<ApiResponse<InvoiceResponse>> {
    let params = new HttpParams();
    if (reason) {
      params = params.set('reason', reason);
    }
    return this.http.post<ApiResponse<InvoiceResponse>>(`${this.baseUrl}/${invoiceId}/cancel`, null, { params });
  }

  generatePdf(invoiceId: string): Observable<ApiResponse<InvoiceResponse>> {
    return this.http.post<ApiResponse<InvoiceResponse>>(`${this.baseUrl}/${invoiceId}/pdf`, null);
  }


  deleteInvoice(invoiceId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${invoiceId}`);
  }
}
