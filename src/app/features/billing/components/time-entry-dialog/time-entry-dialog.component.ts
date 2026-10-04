import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TimeEntryResponse, LogTimeRequest } from '../../types/time-entry.types';
import { CustomSelectComponent, CustomSelectOption } from '../../../../shared/ui/custom-select/custom-select.component';
import { formatDuration } from '../../utils/billing.utils';

@Component({
  selector: 'app-time-entry-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './time-entry-dialog.component.html',
})
export class TimeEntryDialogComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() editEntry: TimeEntryResponse | null = null;
  @Input() isSubmitting = false;
  @Input() projectOptions: CustomSelectOption[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<LogTimeRequest>();

  form!: FormGroup;

  get isEditing(): boolean {
    return !!this.editEntry;
  }

  get computedDuration(): string {
    const start = this.form?.get('startTime')?.value;
    const end = this.form?.get('endTime')?.value;
    if (!start || !end) return '—';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs <= 0) return 'Invalid';
    return formatDuration(Math.round(diffMs / 60000));
  }

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editEntry'] || changes['isOpen']) {
      this.buildForm();
    }
  }

  close(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    const raw = this.form.getRawValue();

    // Validate end > start
    const startDate = new Date(raw.startTime);
    const endDate = new Date(raw.endTime);
    if (endDate <= startDate) return;

    const req: LogTimeRequest = {
      projectId: raw.projectId,
      taskId: raw.taskId || undefined,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      description: raw.description,
      billable: raw.billable,
    };
    this.submitted.emit(req);
  }

  private toLocalDateTimeValue(isoString: string | undefined): string {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      // Format as YYYY-MM-DDTHH:mm for datetime-local input
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${y}-${mo}-${day}T${h}:${mi}`;
    } catch {
      return '';
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      projectId: [this.editEntry?.projectId ?? '', [Validators.required]],
      taskId: [this.editEntry?.taskId ?? ''],
      startTime: [this.toLocalDateTimeValue(this.editEntry?.startTime || new Date().toISOString()), [Validators.required]],
      endTime: [this.toLocalDateTimeValue(this.editEntry?.endTime || new Date().toISOString()), [Validators.required]],
      description: [this.editEntry?.description ?? '', [Validators.required, Validators.maxLength(500)]],
      billable: [this.editEntry?.billable ?? true],
    });
  }
}
