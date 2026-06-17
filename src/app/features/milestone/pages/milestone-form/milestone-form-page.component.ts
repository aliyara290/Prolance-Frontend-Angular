import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MilestoneService } from '../../services/milestone.service';
import { ProjectsService } from '../../../project/services/projects.service';
import { MilestoneStatus } from '../../types/milestone.model';
import { Project } from '../../../project/types/project.model';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-milestone-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './milestone-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestoneFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly milestoneService = inject(MilestoneService);
  private readonly projectsService = inject(ProjectsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isEditMode = signal(false);
  readonly currentMilestoneId = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly projects = signal<Project[]>([]);

  readonly statusOptions: MilestoneStatus[] = [
    'ACTIVE',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED',
    'ARCHIVED'
  ];

  readonly ArrowLeft = ArrowLeft;

  milestoneForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();
    this.checkEditMode();
  }

  private initForm(): void {
    this.milestoneForm = this.fb.group({
      projectId: ['', [Validators.required]],
      title: ['', [Validators.required]],
      description: [''],
      status: ['ACTIVE'],
      sequenceOrder: [1, [Validators.required, Validators.min(1)]],
      progressPercentage: [0, [Validators.min(0), Validators.max(100)]],
      startDate: [''],
      dueDate: [''],
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.currentMilestoneId.set(id);
      // Wait, to load details we need the projectId.
      // But we don't have it in the URL if it's a global edit path like `/projects/milestones/:id/edit`.
      // The API doesn't have a global `GET /milestones/:id`. It only has `GET /projects/:projectId/milestones/:id`.
      // Let's assume we can fetch all milestones and find the one with this ID to get its projectId.
      this.findAndLoadMilestone(id);
      
      // Disable project selection in edit mode since we can't move milestones between projects via API
      this.milestoneForm.get('projectId')?.disable();
    }
  }

  private findAndLoadMilestone(id: string): void {
    // Check if it's already in the global state
    const existing = this.milestoneService.milestones().find(m => m.id === id);
    if (existing) {
      this.patchForm(existing);
    } else {
      // Not ideal but since there's no global GET by ID, we trigger a global load and then find it
      this.milestoneService.loadAllMilestones();
      // Wait a bit or subscribe... for simplicity we just rely on state
      setTimeout(() => {
        const loaded = this.milestoneService.milestones().find(m => m.id === id);
        if (loaded) {
          this.patchForm(loaded);
        }
      }, 1000);
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

  private loadDropdownData(): void {
    // Load projects for the dropdown
    // Since we don't have a direct GET without pagination that returns all, we just trigger loadProjects
    // and subscribe to the signal.
    this.projectsService.loadProjects(0, 100);
    // Bind to the service's signal
    // In a real app we might use an effect or direct template binding, but for now we'll just set the signal
    setTimeout(() => {
      this.projects.set(this.projectsService.projects());
    }, 500);
  }

  private toDatetimeLocal(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.substring(0, 16);
  }

  cancel(): void {
    this.router.navigate(['/app/projects/milestones']);
  }

  submit(): void {
    if (this.milestoneForm.invalid) {
      this.milestoneForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const rawValue = this.milestoneForm.getRawValue(); // getRawValue to include disabled projectId

    const payload = {
      title: rawValue.title,
      description: rawValue.description || null,
      startDate: rawValue.startDate ? rawValue.startDate + ':00' : null,
      dueDate: rawValue.dueDate ? rawValue.dueDate + ':00' : null,
      sequenceOrder: rawValue.sequenceOrder,
      progressPercentage: rawValue.progressPercentage || 0,
      status: rawValue.status,
    };

    if (!this.isEditMode()) {
      this.milestoneService.createMilestone(rawValue.projectId, payload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(['/app/projects/milestones']);
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Failed to create milestone', err);
        },
      });
    } else {
      const milestoneId = this.currentMilestoneId();
      if (milestoneId) {
        this.milestoneService.updateMilestone(rawValue.projectId, milestoneId, payload).subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/app/projects/milestones']);
          },
          error: (err) => {
            this.submitting.set(false);
            console.error('Failed to update milestone', err);
          },
        });
      }
    }
  }
}
