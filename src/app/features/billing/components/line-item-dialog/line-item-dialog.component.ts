import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LineItemUnit, LINE_ITEM_UNIT_LABELS } from '../../types/billing.enums';
import { InvoiceLineItemResponse } from '../../types/invoice.types';

@Component({
  selector: 'app-line-item-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './line-item-dialog.component.html',
})
export class LineItemDialogComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() editItem: InvoiceLineItemResponse | null = null;
  @Input() isSubmitting = false;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<{
    description: string;
    quantity: number;
    unit: LineItemUnit;
    unitPrice: number;
    displayOrder?: number;
    userId?: string;
  }>();

  form!: FormGroup;

  readonly unitOptions = Object.values(LineItemUnit);
  readonly unitLabels = LINE_ITEM_UNIT_LABELS;

  get isEditing(): boolean {
    return !!this.editItem;
  }

  get computedLineTotal(): number {
    const qty = this.form?.get('quantity')?.value ?? 0;
    const price = this.form?.get('unitPrice')?.value ?? 0;
    return qty * price;
  }

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editItem'] || changes['isOpen']) {
      this.buildForm();
    }
  }

  close(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.submitted.emit(this.form.getRawValue());
  }

  private buildForm(): void {
    this.form = this.fb.group({
      description: [this.editItem?.description ?? '', [Validators.required, Validators.maxLength(500)]],
      quantity: [this.editItem?.quantity ?? 1, [Validators.required, Validators.min(0.01)]],
      unit: [this.editItem?.unit ?? LineItemUnit.HOUR, [Validators.required]],
      unitPrice: [this.editItem?.unitPrice ?? 0, [Validators.required, Validators.min(0)]],
      displayOrder: [this.editItem?.displayOrder ?? undefined],
      userId: [this.editItem?.userId ?? ''],
    });
  }
}
