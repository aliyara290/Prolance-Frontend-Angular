import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MilestoneService } from '../../services/milestone.service';
import { MilestoneTableComponent } from '../../components/milestone-table/milestone-table.component';
import { MilestoneKanbanComponent } from '../../components/milestone-kanban/milestone-kanban.component';
import { ModuleHeaderComponent } from '../../../../shared/ui/module-header/module-header.component';
import { ModuleTab, ModuleHeaderAction } from '../../../../shared/ui/module-header/module-header.types';
import { DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { Milestone, MilestoneStatus } from '../../types/milestone.model';
import { EntityListSkeletonComponent } from '../../../../shared/ui/skeletons/entity-list-skeleton/entity-list-skeleton.component';

@Component({
  selector: 'app-milestones-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ModuleHeaderComponent,
    MilestoneTableComponent,
    MilestoneKanbanComponent,
    EntityListSkeletonComponent,
  ],
  templateUrl: './milestones-page.component.html',
})
export class MilestonesPageComponent implements OnInit {
  private readonly milestoneService = inject(MilestoneService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly milestones = this.milestoneService.milestones;
  readonly totalCount = this.milestoneService.totalCount;
  readonly loading = this.milestoneService.loading;
  readonly error = this.milestoneService.error;

  readonly activeView = signal<'list' | 'kanban'>('list');

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

  ngOnInit(): void {
    this.milestoneService.loadAllMilestones();
    this.route.queryParams.subscribe(params => {
      const view = params['view'];
      if (view === 'kanban') {
        this.activeView.set('kanban');
      } else {
        this.activeView.set('list');
      }
    });
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
    this.router.navigate(['/app/projects/milestones/create']);
  }

  onEditMilestone(milestone: Milestone): void {
    this.router.navigate(['/app/projects/milestones', milestone.id, 'edit']);
  }

  onViewMilestone(milestone: Milestone): void {
    this.router.navigate(['/app/projects/milestones', milestone.id]);
  }

  onCompleteMilestone(milestone: Milestone): void {
    this.milestoneService.completeMilestone(milestone.projectId, milestone.id).subscribe();
  }

  onDeleteMilestone(milestone: Milestone): void {
    if (confirm('Are you sure you want to delete this milestone?')) {
      this.milestoneService.deleteMilestone(milestone.projectId, milestone.id).subscribe();
    }
  }

  onStatusChange(event: { milestone: Milestone; newStatus: MilestoneStatus }): void {
    const { milestone, newStatus } = event;
    const payload = {
      title: milestone.title,
      description: milestone.description,
      startDate: milestone.startDate,
      dueDate: milestone.dueDate,
      sequenceOrder: milestone.sequenceOrder,
      progressPercentage: milestone.progressPercentage,
      status: newStatus
    };
    this.milestoneService.updateMilestone(milestone.projectId, milestone.id, payload).subscribe();
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
