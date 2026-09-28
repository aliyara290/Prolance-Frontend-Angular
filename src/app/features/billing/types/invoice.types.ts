import { BillingType, InvoiceStatus, LineItemUnit } from './billing.enums';

// ─── API Response Wrappers ───

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: unknown;
  timestamp?: string;
}

export interface SpringPage<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export interface PageResponse<T> {
  success: boolean;
  data: SpringPage<T>;
}

// ─── Invoice Requests ───

export interface CreateInvoiceRequest {
  projectId: string;
  clientId: string;
  billingType: BillingType;
  issueDate: string;
  dueDate: string;
  periodStartDate?: string;
  periodEndDate?: string;
  taxRate?: number;
  notes?: string;
}

export interface GenerateInvoiceRequest {
  projectId: string;
  clientId: string;
  periodStartDate: string;
  periodEndDate: string;
  dueDate: string;
  taxRate?: number;
  notes?: string;
}

export interface UpdateInvoiceRequest {
  issueDate?: string;
  dueDate?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  taxRate?: number;
  notes?: string;
}

export interface AddLineItemRequest {
  userId?: string;
  description: string;
  quantity: number;
  unit: LineItemUnit;
  unitPrice: number;
  displayOrder?: number;
}

export interface UpdateLineItemRequest {
  description?: string;
  quantity?: number;
  unit?: LineItemUnit;
  unitPrice?: number;
  displayOrder?: number;
}

// ─── Invoice Responses ───

export interface InvoiceResponse {
  id: string;
  tenantId: string;
  projectId: string;
  clientId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  billingType: BillingType;
  issueDate: string;
  dueDate: string;
  periodStartDate?: string;
  periodEndDate?: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  attachmentId?: string;
  lineItems: InvoiceLineItemResponse[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InvoiceSummaryResponse {
  id: string;
  projectId: string;
  clientId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  billingType: BillingType;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

export interface InvoiceLineItemResponse {
  id: string;
  userId?: string;
  description: string;
  quantity: number;
  unit: LineItemUnit;
  unitPrice: number;
  lineTotal: number;
  displayOrder: number;
}
