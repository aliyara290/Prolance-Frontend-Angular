import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { ClientsService } from '../../../crm/clients/services/clients.service';
import { ProjectStatus, ProjectPriority } from '../../types/project.model';
import { Client } from '../../../crm/clients/types/client.model';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-project-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './project-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly projectsService = inject(ProjectsService);
  private readonly clientsService = inject(ClientsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isEditMode = signal(false);
  readonly currentProjectId = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly clients = signal<Client[]>([]);

  readonly priorityOptions: ProjectPriority[] = [
    ProjectPriority.LOW,
    ProjectPriority.MEDIUM,
    ProjectPriority.HIGH,
  ];

  readonly statusOptions: ProjectStatus[] = [
    ProjectStatus.PLANNED,
    ProjectStatus.ACTIVE,
    ProjectStatus.ON_HOLD,
    ProjectStatus.COMPLETED,
    ProjectStatus.CANCELLED,
  ];

  readonly ArrowLeft = ArrowLeft;

  projectForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();
    this.checkEditMode();
  }

  private initForm(): void {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      prefix: [''],
      priority: [ProjectPriority.MEDIUM, [Validators.required]],
      status: [ProjectStatus.PLANNED],
      plannedStartDate: ['', [Validators.required]],
      plannedEndDate: ['', [Validators.required]],
      actualStartDate: [''],
      actualEndDate: [''],
      estimatedBudget: [null],
      actualCost: [null],
      clientId: [''],
      opportunityId: [''],
      projectManagerId: [''],
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.currentProjectId.set(id);
      this.loadProjectDetails(id);
    }
  }

  private loadProjectDetails(id: string): void {
    this.projectsService.getProject(id).subscribe({
      next: (res) => {
        const project = res.data;
        if (project) {
          this.projectForm.patchValue({
            name: project.name,
            description: project.description || '',
            prefix: project.prefix,
            priority: project.priority,
            status: project.status,
            plannedStartDate: project.plannedStartDate
              ? this.toDatetimeLocal(project.plannedStartDate)
              : '',
            plannedEndDate: project.plannedEndDate
              ? this.toDatetimeLocal(project.plannedEndDate)
              : '',
            actualStartDate: project.actualStartDate
              ? this.toDatetimeLocal(project.actualStartDate)
              : '',
            actualEndDate: project.actualEndDate
              ? this.toDatetimeLocal(project.actualEndDate)
              : '',
            estimatedBudget: project.estimatedBudget,
            actualCost: project.actualCost,
            clientId: project.clientId || '',
            projectManagerId: project.projectManagerId || '',
          });
        }
      },
      error: (err) => console.error('Failed to load project', err),
    });
  }

  private loadDropdownData(): void {
    this.clientsService.getClients().subscribe({
      next: (res) => this.clients.set(res.data || []),
      error: (err) => console.error('Failed to load clients', err),
    });
  }

  private toDatetimeLocal(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.substring(0, 16);
  }

  cancel(): void {
    if (this.isEditMode() && this.currentProjectId()) {
      this.router.navigate(['/app/projects/all', this.currentProjectId()]);
    } else {
      this.router.navigate(['/app/projects/all']);
    }
  }

  submit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const rawValue = this.projectForm.value;

    if (!this.isEditMode()) {
      const createPayload = {
        clientId: rawValue.clientId || null,
        opportunityId: rawValue.opportunityId || null,
        name: rawValue.name,
        description: rawValue.description || null,
        priority: rawValue.priority,
        plannedStartDate: rawValue.plannedStartDate + ':00',
        plannedEndDate: rawValue.plannedEndDate + ':00',
        estimatedBudget: rawValue.estimatedBudget || 0,
        projectManagerId: rawValue.projectManagerId || null,
      };

      this.projectsService.createProject(createPayload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(['/app/projects/all']);
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Failed to create project', err);
        },
      });
    } else {
      const projectId = this.currentProjectId();
      if (projectId) {
        const updatePayload = {
          name: rawValue.name,
          description: rawValue.description || null,
          prefix: rawValue.prefix,
          status: rawValue.status,
          priority: rawValue.priority,
          plannedStartDate: rawValue.plannedStartDate
            ? rawValue.plannedStartDate + ':00'
            : null,
          plannedEndDate: rawValue.plannedEndDate
            ? rawValue.plannedEndDate + ':00'
            : null,
          actualStartDate: rawValue.actualStartDate
            ? rawValue.actualStartDate + ':00'
            : null,
          actualEndDate: rawValue.actualEndDate
            ? rawValue.actualEndDate + ':00'
            : null,
          estimatedBudget: rawValue.estimatedBudget || 0,
          actualCost: rawValue.actualCost || 0,
          projectManagerId: rawValue.projectManagerId || null,
        };

        this.projectsService.updateProject(projectId, updatePayload).subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/app/projects/all', projectId]);
          },
          error: (err) => {
            this.submitting.set(false);
            console.error('Failed to update project', err);
          },
        });
      }
    }
  }
}
