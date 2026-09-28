// ─── Billing Type ───
export enum BillingType {
  HOURLY = 'HOURLY',
  FIXED_PRICE = 'FIXED_PRICE',
  MILESTONE = 'MILESTONE',
}

export const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  [BillingType.HOURLY]: 'Hourly',
  [BillingType.FIXED_PRICE]: 'Fixed Price',
  [BillingType.MILESTONE]: 'Milestone',
};

// ─── Invoice Status ───
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'Draft',
  [InvoiceStatus.SENT]: 'Sent',
  [InvoiceStatus.PAID]: 'Paid',
  [InvoiceStatus.OVERDUE]: 'Overdue',
  [InvoiceStatus.CANCELLED]: 'Cancelled',
  [InvoiceStatus.PARTIALLY_PAID]: 'Partially Paid',
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, { bg: string; text: string }> = {
  [InvoiceStatus.DRAFT]: { bg: 'var(--color-bg-muted)', text: 'var(--color-text-muted)' },
  [InvoiceStatus.SENT]: { bg: 'var(--color-info-soft)', text: 'var(--color-info)' },
  [InvoiceStatus.PAID]: { bg: 'var(--color-success-soft)', text: 'var(--color-success)' },
  [InvoiceStatus.OVERDUE]: { bg: 'var(--color-danger-soft)', text: 'var(--color-danger)' },
  [InvoiceStatus.CANCELLED]: { bg: 'var(--color-bg-muted)', text: 'var(--color-text-muted)' },
  [InvoiceStatus.PARTIALLY_PAID]: { bg: 'var(--color-warning-soft)', text: 'var(--color-warning)' },
};

// ─── Line Item Unit ───
export enum LineItemUnit {
  HOUR = 'HOUR',
  DAY = 'DAY',
  FIXED = 'FIXED',
}

export const LINE_ITEM_UNIT_LABELS: Record<LineItemUnit, string> = {
  [LineItemUnit.HOUR]: 'Hour',
  [LineItemUnit.DAY]: 'Day',
  [LineItemUnit.FIXED]: 'Fixed',
};

// ─── Seniority Level ───
export enum SeniorityLevel {
  JUNIOR = 'JUNIOR',
  CONFIRMED = 'CONFIRMED',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  EXPERT = 'EXPERT',
}

export const SENIORITY_LEVEL_LABELS: Record<SeniorityLevel, string> = {
  [SeniorityLevel.JUNIOR]: 'Junior',
  [SeniorityLevel.CONFIRMED]: 'Confirmed',
  [SeniorityLevel.SENIOR]: 'Senior',
  [SeniorityLevel.LEAD]: 'Lead',
  [SeniorityLevel.EXPERT]: 'Expert',
};

// ─── Education Level ───
export enum EducationLevel {
  BAC_PLUS_2 = 'BAC_PLUS_2',
  BAC_PLUS_3 = 'BAC_PLUS_3',
  BAC_PLUS_5 = 'BAC_PLUS_5',
  BAC_PLUS_7 = 'BAC_PLUS_7',
  OTHER = 'OTHER',
}

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  [EducationLevel.BAC_PLUS_2]: 'Bac+2',
  [EducationLevel.BAC_PLUS_3]: 'Bac+3',
  [EducationLevel.BAC_PLUS_5]: 'Bac+5',
  [EducationLevel.BAC_PLUS_7]: 'Bac+7',
  [EducationLevel.OTHER]: 'Other',
};
