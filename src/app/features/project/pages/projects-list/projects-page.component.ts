import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { ProjectsTableComponent } from '../../components/projects-table/projects-table.component';
import { ProjectsKanbanComponent } from '../../components/projects-kanban/projects-kanban.component';
import { ModuleHeaderComponent } from '../../../../shared/ui/module-header/module-header.component';
import { ModuleTab, ModuleHeaderAction } from '../../../../shared/ui/module-header/module-header.types';
import { DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { Project, ProjectStatus, ProjectPriority } from '../../types/project.model';
import {
  EntityListSkeletonComponent,
} from '../../../../shared/ui/skeletons/entity-list-skeleton/entity-list-skeleton.component';
import { ProjectFiltersComponent, ProjectFilters } from '../../components/project-filters/project-filters.component';
import { LucideAngularModule, PanelLeftClose, PanelLeftOpen } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import {ErrorMessageComponent} from '../../../../shared/ui/error-message/error-message.component';
import { ConfirmModalService } from '../../../../shared/ui/confirm-modal/confirm-modal.service';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LucideAngularModule,
    ModuleHeaderComponent,
    ProjectsTableComponent,
    ProjectsKanbanComponent,
    EntityListSkeletonComponent,
    ProjectFiltersComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './projects-page.component.html',
})
export class ProjectsPageComponent implements OnInit {
  private readonly projectsService = inject(ProjectsService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly confirmService = inject(ConfirmModalService);

  readonly projects = this.projectsService.projects;
  readonly totalCount = this.projectsService.totalCount;
  readonly loading = this.projectsService.loading;
  readonly error = this.projectsService.error;

  readonly activeView = signal<'list' | 'kanban'>('list');

  // Sidebar & Filters
  readonly sidebarVisible = signal<boolean>(true);
  readonly activeFilters = signal<ProjectFilters>({
    statuses: [],
    priorities: [],
    dueDateFilter: 'all',
  });

  readonly icons = {
    panelClose: PanelLeftClose,
    panelOpen: PanelLeftOpen,
  };

  readonly filteredProjects = computed<Project[]>(() => {
    const filters = this.activeFilters();
    let result = this.projects();

    if (filters.statuses.length > 0) {
      result = result.filter(p => filters.statuses.includes(p.status));
    }

    if (filters.priorities.length > 0) {
      result = result.filter(p => filters.priorities.includes(p.priority));
    }

    if (filters.dueDateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7);

      result = result.filter(p => {
        // Use plannedEndDate for projects
        if (!p.plannedEndDate) return false;
        const due = new Date(p.plannedEndDate);
        if (filters.dueDateFilter === 'overdue') return due < today;
        if (filters.dueDateFilter === 'today') return due >= today && due <= endOfToday;
        if (filters.dueDateFilter === 'week') return due >= today && due <= endOfWeek;
        return true;
      });
    }

    return result;
  });

  readonly tabs: ModuleTab[] = [
    { id: 'all', label: 'All Projects', count: this.projectsService.totalCount() },
  ];

  readonly activeTabId = signal<string>('all');

  readonly primaryActionItems: DropdownMenuItem[] = [
    { label: 'Import Projects', value: 'import' },
    { label: 'Import from CSV', value: 'import-csv', dividerBefore: true },
  ];

  readonly moreActions: ModuleHeaderAction[] = [
    { label: 'Export Projects', value: 'export' },
    { label: 'Mass Update', value: 'mass-update', dividerBefore: true },
    { label: 'Delete All Projects', value: 'delete-all', danger: true, dividerBefore: true },
  ];

  ngOnInit(): void {
    this.projectsService.loadProjects();
  }

  onTabChange(tab: ModuleTab): void {
    this.activeTabId.set(tab.id);
  }

  onViewChange(view: 'list' | 'kanban'): void {
    this.activeView.set(view);
  }

  toggleSidebar(): void {
    this.sidebarVisible.update(v => !v);
  }

  onFiltersChanged(filters: ProjectFilters): void {
    this.activeFilters.set(filters);
  }

  onCreate(): void {
    this.router.navigate(['/app/projects/all/create']);
  }

  onEditProject(project: Project): void {
    this.router.navigate(['/app/projects/all', project.id, 'edit']);
  }

  async onDeleteProject(project: Project): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Project',
      message: `Are you sure you want to delete project "${project.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });
    if (confirmed) {
      this.projectsService.deleteProject(project.id).subscribe();
    }
  }

  onViewProject(project: Project): void {
    this.router.navigate(['/app/projects/all', project.id]);
  }

  onStatusChange(event: { project: Project; newStatus: ProjectStatus }): void {
    const previousStatus = event.project.status;
    const payload = {
      name: event.project.name,
      description: event.project.description,
      prefix: event.project.prefix,
      status: event.newStatus,
      priority: event.project.priority,
      plannedStartDate: event.project.plannedStartDate,
      plannedEndDate: event.project.plannedEndDate,
      actualStartDate: event.project.actualStartDate,
      actualEndDate: event.project.actualEndDate,
      estimatedBudget: event.project.estimatedBudget,
      actualCost: event.project.actualCost,
      projectManagerId: event.project.projectManagerId,
    };
    this.projectsService.updateProject(event.project.id, payload).subscribe({
      next: () => {
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to update project status', err);
        // Revert the optimistic update
        this.projectsService.revertProjectStatus(event.project.id, previousStatus);
        this.cdr.markForCheck();
      },
    });
  }

  onPrimaryActionSelected(item: DropdownMenuItem): void {
    console.log('Primary action:', item.value);
  }

  onMoreAction(action: ModuleHeaderAction): void {
    console.log('More action:', action.value);
  }
}

