import { Component, Input } from '@angular/core';
import {
  InvoiceStatus,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
} from '../../types/billing.enums';

@Component({
  selector: 'app-invoice-status-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-full)] text-xs font-medium whitespace-nowrap"
      [style.backgroundColor]="colors.bg"
      [style.color]="colors.text"
    >
      <span class="w-1.5 h-1.5 rounded-full" [style.backgroundColor]="colors.text"></span>
      {{ label }}
    </span>
  `,
})
export class InvoiceStatusBadgeComponent {
  @Input({ required: true }) status!: InvoiceStatus;

  get label(): string {
    return INVOICE_STATUS_LABELS[this.status] ?? this.status;
  }

  get colors(): { bg: string; text: string } {
    return INVOICE_STATUS_COLORS[this.status] ?? { bg: 'var(--color-bg-muted)', text: 'var(--color-text-muted)' };
  }
}
