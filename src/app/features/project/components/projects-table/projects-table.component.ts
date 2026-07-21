import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { Project, ProjectStatus, ProjectPriority } from '../../types/project.model';
import { ProjectsService } from '../../services/projects.service';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface SelectOption {
  label: string;
  value: string;
}

import { ConfirmModalService } from '../../../../shared/ui/confirm-modal/confirm-modal.service';

@Component({
  selector: 'app-projects-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    InputTextModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    SharedModule,
    DropdownMenuComponent,
    RouterModule,
  ],
  templateUrl: './projects-table.component.html',
  styleUrls: ['./projects-table.component.css'],
})
export class ProjectsTableComponent {
  private readonly projectsService = inject(ProjectsService);
  private readonly confirmService = inject(ConfirmModalService);
  private readonly searchSubject = new Subject<string>();

  @Input({ required: true }) projects: Project[] = [];
  @Input() totalCount = 0;

  @Output() editProject = new EventEmitter<Project>();

  @ViewChild('dt') dt!: Table;

  readonly statusOptions: SelectOption[] = [
    { label: 'Planned', value: 'PLANNED' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'On Hold', value: 'ON_HOLD' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  readonly priorityOptions: SelectOption[] = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
  ];

  filterStatus: string | null = null;
  filterPriority: string | null = null;

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      if (searchTerm && searchTerm.length >= 2) {
        this.projectsService.loadProjects(undefined, undefined, searchTerm);
      } else if (!searchTerm) {
        this.projectsService.loadProjects();
      }
    });
  }

  onGlobalSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(value, 'contains');
    this.searchSubject.next(value);
  }

  getStatusSeverity(status: ProjectStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<ProjectStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      PLANNED: 'info',
      ACTIVE: 'success',
      ON_HOLD: 'warn',
      COMPLETED: 'secondary',
      CANCELLED: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  getPrioritySeverity(priority: ProjectPriority): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<ProjectPriority, 'success' | 'warn' | 'danger'> = {
      LOW: 'success',
      MEDIUM: 'warn',
      HIGH: 'danger',
    };
    return map[priority] ?? 'secondary';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  clearFilters(): void {
    this.filterStatus = null;
    this.filterPriority = null;
    this.dt.clear();
    this.projectsService.loadProjects();
  }

  readonly moreActions: DropdownMenuItem[] = [
    { label: 'Edit Project', value: 'edit' },
    { label: 'Delete Project', value: 'delete', danger: true, dividerBefore: true },
  ];

  async onMoreAction(item: DropdownMenuItem, project: Project): Promise<void> {
    if (item.value === 'edit') {
      this.editProject.emit(project);
    } else if (item.value === 'delete') {
      const confirmed = await this.confirmService.confirm({
        title: 'Delete Project',
        message: `Are you sure you want to delete project "${project.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        danger: true
      });
      if (confirmed) {
        this.projectsService.deleteProject(project.id).subscribe({
          next: () => console.log('Project deleted successfully'),
          error: (err) => console.error('Failed to delete project', err),
        });
      }
    }
  }
}
