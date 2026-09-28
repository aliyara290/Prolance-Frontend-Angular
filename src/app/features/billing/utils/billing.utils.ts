import { InvoiceStatus } from '../types/billing.enums';

/**
 * Format duration in minutes to human-readable string.
 * e.g. 150 → "2h 30m", 45 → "45m", 0 → "0m"
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Returns the actions available for a given invoice status.
 * This does NOT dictate backend transitions — it only controls UI action visibility.
 */
export type InvoiceAction = 'edit' | 'send' | 'pay' | 'partial-pay' | 'cancel' | 'pdf' | 'delete';

export function getAvailableActions(status: InvoiceStatus): InvoiceAction[] {
  switch (status) {
    case InvoiceStatus.DRAFT:
      return ['edit', 'send', 'pdf', 'delete'];
    case InvoiceStatus.SENT:
      return ['pay', 'partial-pay', 'cancel', 'pdf'];
    case InvoiceStatus.PARTIALLY_PAID:
      return ['pay', 'partial-pay', 'cancel', 'pdf'];
    case InvoiceStatus.OVERDUE:
      return ['pay', 'partial-pay', 'cancel', 'pdf'];
    case InvoiceStatus.PAID:
      return ['pdf'];
    case InvoiceStatus.CANCELLED:
      return ['pdf'];
    default:
      return [];
  }
}

/**
 * Format a date range for display.
 */
export function formatDateRange(start: string | undefined, end: string | undefined): string {
  if (!start && !end) return '—';
  const fmt = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return d;
    }
  };
  if (start && end) return `${fmt(start)} — ${fmt(end)}`;
  if (start) return `From ${fmt(start)}`;
  return `Until ${fmt(end!)}`;
}

/**
 * Format a single date for display.
 */
export function formatDate(date: string | undefined): string {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return date;
  }
}

/**
 * Format a datetime for display.
 */
export function formatDateTime(datetime: string | undefined): string {
  if (!datetime) return '—';
  try {
    return new Date(datetime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return datetime;
  }
}

/**
 * Format currency amount.
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
