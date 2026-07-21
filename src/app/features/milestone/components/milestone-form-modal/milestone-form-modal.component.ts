import { Component, Input, Output, EventEmitter, inject, signal, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MilestoneService } from '../../services/milestone.service';
import { ProjectsService } from '../../../project/services/projects.service';
import { MilestoneStatus } from '../../types/milestone.model';
import { Flag, X, LucideAngularModule } from 'lucide-angular';
import { CustomSelectComponent, CustomSelectOption } from '../../../../shared/ui/custom-select/custom-select.component';

@Component({
  selector: 'app-milestone-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, CustomSelectComponent],
  templateUrl: './milestone-form-modal.component.html',
  styleUrls: ['./milestone-form-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestoneFormModalComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly milestoneService = inject(MilestoneService);
  private readonly projectsService = inject(ProjectsService);

  @Input() isOpen = false;
  @Input() projectId: string | null = null;
  @Input() editMilestoneId: string | null = null; // If provided, edit mode

  @Output() closePanel = new EventEmitter<void>();
  @Output() milestoneSaved = new EventEmitter<void>();

  readonly submitting = signal(false);
  readonly projects = this.projectsService.projects;

  readonly statusOptions: MilestoneStatus[] = [
    'ACTIVE',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED',
    'ARCHIVED'
  ];

  get projectSelectOptions(): CustomSelectOption[] {
    return this.projects().map(p => ({ label: p.name, value: p.id }));
  }

  readonly statusSelectOptions: CustomSelectOption[] = this.statusOptions.map(s => ({
    label: s.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
    value: s
  }));

  readonly icons = { flag: Flag, x: X };

  milestoneForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.projectsService.loadProjects(0, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      if (this.milestoneForm) {
        this.initForm();
      }
      if (this.editMilestoneId && this.projectId) {
        this.loadMilestoneDetails(this.projectId, this.editMilestoneId);
      } else if (this.editMilestoneId) {
        // If projectId is not passed, find it from global list
        this.findMilestoneDetailsFromGlobalList(this.editMilestoneId);
      }
    }
  }

  private initForm(): void {
    this.milestoneForm = this.fb.group({
      projectId: [{value: this.projectId || '', disabled: !!this.editMilestoneId}, [Validators.required]],
      title: ['', [Validators.required]],
      description: [''],
      status: ['ACTIVE'],
      sequenceOrder: [1, [Validators.required, Validators.min(1)]],
      progressPercentage: [0, [Validators.min(0), Validators.max(100)]],
      startDate: [''],
      dueDate: [''],
    });
  }

  private loadMilestoneDetails(projectId: string, id: string): void {
    this.milestoneService.getMilestone(projectId, id).subscribe({
      next: (res) => {
        const milestone = res.data;
        if (milestone) {
          this.patchForm(milestone);
        }
      },
      error: (err) => console.error('Failed to load milestone', err),
    });
  }

  private findMilestoneDetailsFromGlobalList(id: string): void {
    const existing = this.milestoneService.milestones().find(m => m.id === id);
    if (existing) {
      this.patchForm(existing);
      // Fetch fresh data
      this.loadMilestoneDetails(existing.projectId, id);
    }
  }

  private patchForm(milestone: any): void {
    this.milestoneForm.patchValue({
      projectId: milestone.projectId,
      title: milestone.title,
      description: milestone.description || '',
      status: milestone.status,
      sequenceOrder: milestone.sequenceOrder,
      progressPercentage: milestone.progressPercentage,
      startDate: milestone.startDate ? this.toDatetimeLocal(milestone.startDate) : '',
      dueDate: milestone.dueDate ? this.toDatetimeLocal(milestone.dueDate) : '',
    });
  }

  private toDatetimeLocal(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.substring(0, 16);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('panel-backdrop')) {
      this.cancel();
    }
  }

  cancel(): void {
    this.closePanel.emit();
    this.milestoneForm.reset();
  }

  submit(): void {
    if (this.milestoneForm.invalid) {
      this.milestoneForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const rawValue = this.milestoneForm.getRawValue();

    const payload = {
      title: rawValue.title,
      description: rawValue.description || null,
      startDate: rawValue.startDate ? rawValue.startDate + ':00' : null,
      dueDate: rawValue.dueDate ? rawValue.dueDate + ':00' : null,
      sequenceOrder: rawValue.sequenceOrder,
      progressPercentage: rawValue.progressPercentage || 0,
      status: rawValue.status,
    };

    if (!this.editMilestoneId) {
      this.milestoneService.createMilestone(rawValue.projectId, payload as any).subscribe({
        next: () => {
          this.submitting.set(false);
          this.milestoneForm.reset();
          this.milestoneSaved.emit();
          this.closePanel.emit();
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Failed to create milestone', err);
        },
      });
    } else {
      const milestoneId = this.editMilestoneId;
      const projectId = rawValue.projectId;
      this.milestoneService.updateMilestone(projectId, milestoneId, payload as any).subscribe({
        next: () => {
          this.submitting.set(false);
          this.milestoneForm.reset();
          this.milestoneSaved.emit();
          this.closePanel.emit();
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Failed to update milestone', err);
        },
      });
    }
  }
}
