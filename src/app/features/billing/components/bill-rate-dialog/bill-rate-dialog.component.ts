import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  SeniorityLevel,
  EducationLevel,
  SENIORITY_LEVEL_LABELS,
  EDUCATION_LEVEL_LABELS,
} from '../../types/billing.enums';
import { BillRateResponse, CreateBillRateRequest, UpdateBillRateRequest } from '../../types/bill-rate.types';
import { CustomSelectComponent, CustomSelectOption } from '../../../../shared/ui/custom-select/custom-select.component';

@Component({
  selector: 'app-bill-rate-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './bill-rate-dialog.component.html',
})
export class BillRateDialogComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() editRate: BillRateResponse | null = null;
  @Input() isSubmitting = false;
  @Input() selectedProjectId: string = '';
  @Input() userOptions: CustomSelectOption[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<CreateBillRateRequest | UpdateBillRateRequest>();

  form!: FormGroup;

  readonly seniorityOptions = Object.values(SeniorityLevel);
  readonly seniorityLabels = SENIORITY_LEVEL_LABELS;
  readonly educationOptions = Object.values(EducationLevel);
  readonly educationLabels = EDUCATION_LEVEL_LABELS;

  get isEditing(): boolean {
    return !!this.editRate;
  }

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editRate'] || changes['isOpen']) {
      this.buildForm();
    }
  }

  close(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    const raw = this.form.getRawValue();

    if (this.isEditing) {
      const req: UpdateBillRateRequest = {
        seniorityLevel: raw.seniorityLevel,
        educationLevel: raw.educationLevel,
        hourlyRate: raw.hourlyRate,
        dailyRate: raw.dailyRate || undefined,
        effectiveFrom: raw.effectiveFrom,
        effectiveTo: raw.effectiveTo || undefined,
      };
      this.submitted.emit(req);
    } else {
      const req: CreateBillRateRequest = {
        projectId: this.selectedProjectId,
        userId: raw.userId,
        seniorityLevel: raw.seniorityLevel,
        educationLevel: raw.educationLevel,
        hourlyRate: raw.hourlyRate,
        dailyRate: raw.dailyRate || undefined,
        effectiveFrom: raw.effectiveFrom,
        effectiveTo: raw.effectiveTo || undefined,
      };
      this.submitted.emit(req);
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      
      userId: [{ value: this.editRate?.userId ?? '', disabled: this.isEditing }, [Validators.required]],
      seniorityLevel: [this.editRate?.seniorityLevel ?? SeniorityLevel.JUNIOR, [Validators.required]],
      educationLevel: [this.editRate?.educationLevel ?? EducationLevel.BAC_PLUS_5, [Validators.required]],
      hourlyRate: [this.editRate?.hourlyRate ?? 0, [Validators.required, Validators.min(0.01)]],
      dailyRate: [this.editRate?.dailyRate ?? null],
      effectiveFrom: [this.editRate?.effectiveFrom ?? '', [Validators.required]],
      effectiveTo: [this.editRate?.effectiveTo ?? ''],
    });
  }
}
