import { Component, Input } from '@angular/core';
import { BillingType, BILLING_TYPE_LABELS } from '../../types/billing.enums';

@Component({
  selector: 'app-billing-type-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-sm)] text-xs font-medium bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] whitespace-nowrap"
    >
      {{ label }}
    </span>
  `,
})
export class BillingTypeBadgeComponent {
  @Input({ required: true }) type!: BillingType;

  get label(): string {
    return BILLING_TYPE_LABELS[this.type] ?? this.type;
  }
}
