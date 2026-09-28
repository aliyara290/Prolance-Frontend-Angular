import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceResponse } from '../../types/invoice.types';
import { formatCurrency } from '../../utils/billing.utils';
import { INVOICE_STATUS_LABELS } from '../../types/billing.enums';

export type InvoiceActionType = 'send' | 'pay' | 'partial-pay' | 'cancel';

interface ActionConfig {
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
  showInput: boolean;
  inputLabel: string;
  inputPlaceholder: string;
}

const ACTION_CONFIGS: Record<InvoiceActionType, ActionConfig> = {
  send: {
    title: 'Send Invoice',
    message: 'This will mark the invoice as sent to the client.',
    confirmLabel: 'Send Invoice',
    danger: false,
    showInput: false,
    inputLabel: '',
    inputPlaceholder: '',
  },
  pay: {
    title: 'Mark as Paid',
    message: 'This will mark the invoice as fully paid.',
    confirmLabel: 'Mark as Paid',
    danger: false,
    showInput: true,
    inputLabel: 'Comment (optional)',
    inputPlaceholder: 'Add a comment about this payment...',
  },
  'partial-pay': {
    title: 'Record Partial Payment',
    message: 'This will mark the invoice as partially paid.',
    confirmLabel: 'Record Payment',
    danger: false,
    showInput: true,
    inputLabel: 'Comment (optional)',
    inputPlaceholder: 'Add a comment about this partial payment...',
  },
  cancel: {
    title: 'Cancel Invoice',
    message: 'This action is significant and may not be reversible. The invoice will be marked as cancelled.',
    confirmLabel: 'Cancel Invoice',
    danger: true,
    showInput: true,
    inputLabel: 'Cancellation reason (optional)',
    inputPlaceholder: 'Why is this invoice being cancelled?',
  },
};

@Component({
  selector: 'app-invoice-action-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-action-dialog.component.html',
})
export class InvoiceActionDialogComponent {
  @Input() isOpen = false;
  @Input() action: InvoiceActionType = 'send';
  @Input() invoice: InvoiceResponse | null = null;
  @Input() isSubmitting = false;
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<string>();

  inputValue = '';

  get config(): ActionConfig {
    return ACTION_CONFIGS[this.action];
  }

  get invoiceSummary(): string {
    if (!this.invoice) return '';
    return `${this.invoice.invoiceNumber} — ${formatCurrency(this.invoice.totalAmount, this.invoice.currency)}`;
  }

  get statusLabel(): string {
    if (!this.invoice) return '';
    return INVOICE_STATUS_LABELS[this.invoice.status] ?? this.invoice.status;
  }

  close(): void {
    this.inputValue = '';
    this.closed.emit();
  }

  onConfirm(): void {
    if (this.isSubmitting) return;
    this.confirmed.emit(this.inputValue.trim());
    this.inputValue = '';
  }
}
