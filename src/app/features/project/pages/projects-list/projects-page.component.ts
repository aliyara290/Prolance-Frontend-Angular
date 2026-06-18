import { Component, inject, signal, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { ProjectsTableComponent } from '../../components/projects-table/projects-table.component';
import { ProjectsKanbanComponent } from '../../components/projects-kanban/projects-kanban.component';
import { ModuleHeaderComponent } from '../../../../shared/ui/module-header/module-header.component';
import { ModuleTab, ModuleHeaderAction } from '../../../../shared/ui/module-header/module-header.types';
import { DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { Project, ProjectStatus } from '../../types/project.model';
import {
  EntityListSkeletonComponent,
} from '../../../../shared/ui/skeletons/entity-list-skeleton/entity-list-skeleton.component';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ModuleHeaderComponent,
    ProjectsTableComponent,
    ProjectsKanbanComponent,
    EntityListSkeletonComponent,
  ],
  templateUrl: './projects-page.component.html',
})
export class ProjectsPageComponent implements OnInit {
  private readonly projectsService = inject(ProjectsService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly projects = this.projectsService.projects;
  readonly totalCount = this.projectsService.totalCount;
  readonly loading = this.projectsService.loading;
  readonly error = this.projectsService.error;

  readonly activeView = signal<'list' | 'kanban'>('list');

  readonly tabs: ModuleTab[] = [
    { id: 'all', label: 'All Projects', count: this.projectsService.totalCount() },
    // { id: 'active', label: 'Active' },
    // { id: 'on-hold', label: 'On Hold' },
    // { id: 'completed', label: 'Completed' },
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

  readonly tabMoreItems: ModuleHeaderAction[] = [
    { label: 'Create View', value: 'create-view' },
    { label: 'Manage Views', value: 'manage-views' },
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

  onCreate(): void {
    this.router.navigate(['/app/projects/all/create']);
  }

  onEditProject(project: Project): void {
    this.router.navigate(['/app/projects/all', project.id, 'edit']);
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

  onTabMore(action: ModuleHeaderAction): void {
    console.log('Tab more:', action.value);
  }
}
