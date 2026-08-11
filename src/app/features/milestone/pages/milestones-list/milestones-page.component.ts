import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MilestoneService } from '../../services/milestone.service';
import { ProjectsService } from '../../../project/services/projects.service';
import { MilestoneTableComponent } from '../../components/milestone-table/milestone-table.component';
import { MilestoneKanbanComponent } from '../../components/milestone-kanban/milestone-kanban.component';
import { ModuleHeaderComponent } from '../../../../shared/ui/module-header/module-header.component';
import { ModuleTab, ModuleHeaderAction } from '../../../../shared/ui/module-header/module-header.types';
import { DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { Milestone, MilestoneStatus } from '../../types/milestone.model';
import { EntityListSkeletonComponent } from '../../../../shared/ui/skeletons/entity-list-skeleton/entity-list-skeleton.component';
import { MilestoneFiltersComponent, MilestoneFilters } from '../../components/milestone-filters/milestone-filters.component';
import { MilestoneFormModalComponent } from '../../components/milestone-form-modal/milestone-form-modal.component';
import { MilestoneDetailPanelComponent } from '../../components/milestone-detail-panel/milestone-detail-panel.component';
import { LucideAngularModule, PanelLeftClose, PanelLeftOpen } from 'lucide-angular';
import { CommonModule } from '@angular/common';

import { ConfirmModalService } from '../../../../shared/ui/confirm-modal/confirm-modal.service';
import {ErrorMessageComponent} from '../../../../shared/ui/error-message/error-message.component';

@Component({
  selector: 'app-milestones-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LucideAngularModule,
    ModuleHeaderComponent,
    MilestoneTableComponent,
    MilestoneKanbanComponent,
    EntityListSkeletonComponent,
    MilestoneFiltersComponent,
    MilestoneFormModalComponent,
    MilestoneDetailPanelComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './milestones-page.component.html',
})
export class MilestonesPageComponent implements OnInit {
  private readonly milestoneService = inject(MilestoneService);
  private readonly projectsService = inject(ProjectsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly confirmService = inject(ConfirmModalService);

  readonly milestones = this.milestoneService.milestones;
  readonly totalCount = this.milestoneService.totalCount;
  readonly loading = this.milestoneService.loading;
  readonly error = this.milestoneService.error;

  readonly activeView = signal<'list' | 'kanban'>('list');

  // Sidebar & Filters
  readonly sidebarVisible = signal<boolean>(true);
  readonly projects = this.projectsService.projectNames;
  readonly scopedProjectId = signal<string | null>(null);

  readonly activeFilters = signal<MilestoneFilters>({
    statuses: [],
    dueDateFilter: 'all',
    projectId: null,
  });

  readonly icons = {
    panelClose: PanelLeftClose,
    panelOpen: PanelLeftOpen,
  };

  readonly filteredMilestones = computed<Milestone[]>(() => {
    const filters = this.activeFilters();
    const scopeId = this.scopedProjectId();
    let result = this.milestones();

    if (scopeId) {
      result = result.filter(m => m.projectId === scopeId);
    }

    if (filters.statuses.length > 0) {
      result = result.filter(m => filters.statuses.includes(m.status));
    }

    if (filters.dueDateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7);

      result = result.filter(m => {
        if (!m.dueDate) return false;
        const due = new Date(m.dueDate);
        if (filters.dueDateFilter === 'overdue') return due < today;
        if (filters.dueDateFilter === 'today') return due >= today && due <= endOfToday;
        if (filters.dueDateFilter === 'week') return due >= today && due <= endOfWeek;
        return true;
      });
    }

    return result;
  });

  readonly tabs: ModuleTab[] = [
    { id: 'all', label: 'All Milestones', count: this.milestoneService.totalCount() },
  ];

  readonly activeTabId = signal<string>('all');

  readonly primaryActionItems: DropdownMenuItem[] = [
    { label: 'Import Milestones', value: 'import' },
  ];

  readonly moreActions: ModuleHeaderAction[] = [
    { label: 'Export Milestones', value: 'export' },
  ];

  readonly tabMoreItems: ModuleHeaderAction[] = [
    { label: 'Manage Views', value: 'manage-views' },
  ];

  // ── Detail Panel ──
  readonly selectedMilestone = signal<Milestone | null>(null);
  readonly panelOpen = signal(false);

  // ── Form Modal ──
  readonly createPanelOpen = signal(false);
  readonly editMilestoneId = signal<string | null>(null);

  ngOnInit(): void {
    this.milestoneService.loadAllMilestones();
    this.projectsService.loadProjectNames();

    this.route.queryParams.subscribe(params => {
      const view = params['view'];
      if (view === 'kanban') {
        this.activeView.set('kanban');
      } else {
        this.activeView.set('list');
      }
    });
  }

  onRefresh(): void {
    const pId = this.scopedProjectId();
    if (pId) {
      this.milestoneService.loadMilestonesByProject(pId);
    } else {
      this.milestoneService.loadAllMilestones();
    }
  }

  toggleSidebar(): void {
    this.sidebarVisible.update(v => !v);
  }

  onFiltersChanged(filters: MilestoneFilters): void {
    this.activeFilters.set(filters);
  }

  onProjectSelected(projectId: string | null): void {
    this.scopedProjectId.set(projectId);
    if (projectId) {
      // Reload milestones for the selected project
      this.milestoneService.loadMilestonesByProject(projectId);
    } else {
      this.milestoneService.loadAllMilestones();
    }
  }

  onTabChange(tab: ModuleTab): void {
    this.activeTabId.set(tab.id);
  }

  onViewChange(view: 'list' | 'kanban'): void {
    this.activeView.set(view);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: view === 'list' ? null : view },
      queryParamsHandling: 'merge'
    });
  }

  onCreate(): void {
    this.createPanelOpen.set(true);
  }

  onCloseCreatePanel(): void {
    this.createPanelOpen.set(false);
    this.editMilestoneId.set(null);
  }

  onEditMilestone(milestone: Milestone): void {
    this.panelOpen.set(false);
    this.editMilestoneId.set(milestone.id);
    this.createPanelOpen.set(true);
  }

  onViewMilestone(milestone: Milestone): void {
    this.selectedMilestone.set(milestone);
    this.panelOpen.set(true);
  }

  onClosePanel(): void {
    this.panelOpen.set(false);
    this.selectedMilestone.set(null);
  }

  onMilestoneUpdated(): void {
    const currentMilestone = this.selectedMilestone();
    if (currentMilestone) {
      this.milestoneService.getMilestone(currentMilestone.projectId, currentMilestone.id).subscribe({
        next: (res) => {
          this.selectedMilestone.set(res.data);
          // The update in MilestoneService's load methods handles lists,
          // but we might need to manually trigger change detection if needed.
        },
      });
    }
  }

  onCompleteMilestone(milestone: Milestone): void {
    this.milestoneService.completeMilestone(milestone.projectId, milestone.id).subscribe();
  }

  async onDeleteMilestone(milestone: Milestone): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Milestone',
      message: 'Are you sure you want to delete this milestone?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });
    if (confirmed) {
      this.milestoneService.deleteMilestone(milestone.projectId, milestone.id).subscribe();
    }
  }

  onStatusChange(event: { milestone: Milestone; newStatus: MilestoneStatus }): void {
    const { milestone, newStatus } = event;
    const previousStatus = milestone.status;
    const payload = {
      title: milestone.title,
      description: milestone.description,
      startDate: milestone.startDate,
      dueDate: milestone.dueDate,
      sequenceOrder: milestone.sequenceOrder,
      progressPercentage: milestone.progressPercentage,
      status: newStatus
    };
    this.milestoneService.updateMilestone(milestone.projectId, milestone.id, payload).subscribe({
      next: () => {
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to update milestone status', err);
        // Revert the optimistic update
        this.milestoneService.revertMilestoneStatus(milestone.id, previousStatus);
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

