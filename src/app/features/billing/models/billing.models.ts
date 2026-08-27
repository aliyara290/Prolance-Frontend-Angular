export interface TimeEntry {
  id: string;
  tenantId: string;
  projectId: string;
  userId: string;
  description: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: 'PENDING' | 'INVOICED';
  createdAt: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  clientId: string;
  projectId: string;
  invoiceNumber: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'VOID';
  billingPeriodStart: string;
  billingPeriodEnd: string;
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  attachmentId: string | null;
  createdAt: string;
}

export interface LogTimeRequest {
  projectId: string;
  userId: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface GenerateInvoiceRequest {
  projectId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  taxPercentage: number;
}
