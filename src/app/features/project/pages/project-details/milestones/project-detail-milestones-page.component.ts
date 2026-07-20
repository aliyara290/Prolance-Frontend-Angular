import {
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  effect,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectDetailService } from '../../../services/project-detail.service';
import { ProjectMilestonesService } from '../../../services/project-milestones.service';
import {
  Milestone,
  MilestoneStatus,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
} from '../../../../milestone/types/milestone.model';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../../shared/ui/dropdown-menu/dropdown-menu.component';

const STATUS_OPTIONS: { value: MilestoneStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'ARCHIVED', label: 'Archived' },
];

import { MilestoneFormModalComponent } from '../../../../milestone/components/milestone-form-modal/milestone-form-modal.component';
import { MilestoneDetailPanelComponent } from '../../../../milestone/components/milestone-detail-panel/milestone-detail-panel.component';
import { EntityListSkeletonComponent } from '../../../../../shared/ui/skeletons/entity-list-skeleton/entity-list-skeleton.component';

@Component({
  selector: 'app-project-detail-milestones-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownMenuComponent, MilestoneFormModalComponent, MilestoneDetailPanelComponent, EntityListSkeletonComponent],
  templateUrl: './project-detail-milestones-page.component.html',
  styleUrls: ['./project-detail-milestones-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailMilestonesPageComponent implements OnInit, OnDestroy {
  readonly detailService = inject(ProjectDetailService);
  readonly milestonesService = inject(ProjectMilestonesService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly statusOptions = STATUS_OPTIONS;

  readonly showCreateModal = signal<boolean>(false);
  readonly editingMilestoneId = signal<string | null>(null);

  readonly showDetailDrawer = signal<boolean>(false);
  readonly selectedMilestone = signal<Milestone | null>(null);

  readonly searchQuery = signal<string>('');
  readonly filterStatus = signal<MilestoneStatus | 'ALL'>('ALL');

  readonly filteredMilestones = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const statusFilter = this.filterStatus();
    let milestones = this.milestonesService.milestones();

    if (statusFilter !== 'ALL') {
      milestones = milestones.filter(m => m.status === statusFilter);
    }
    if (!query) return milestones;

    return milestones.filter(m =>
      m.title.toLowerCase().includes(query) ||
      (m.description && m.description.toLowerCase().includes(query))
    );
  });

  constructor() {
    effect(() => {
      const project = this.detailService.project();
      if (project) {
        this.milestonesService.loadMilestones(project.id);
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.milestonesService.clear();
  }


  openCreateModal(): void {
    this.editingMilestoneId.set(null);
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.editingMilestoneId.set(null);
  }

  onMilestoneSaved(): void {
    const project = this.detailService.project();
    if (project) {
      this.milestonesService.loadMilestones(project.id);
    }
  }


  openDetailDrawer(milestone: Milestone): void {
    this.selectedMilestone.set(milestone);
    this.showDetailDrawer.set(true);
  }

  closeDetailDrawer(): void {
    this.showDetailDrawer.set(false);
    this.selectedMilestone.set(null);
  }


  startEdit(milestone: Milestone, event?: Event): void {
    if (event) event.stopPropagation();
    this.showDetailDrawer.set(false);
    this.editingMilestoneId.set(milestone.id);
    this.showCreateModal.set(true);
  }


  onComplete(milestone: Milestone, event: Event): void {
    event.stopPropagation();
    const project = this.detailService.project();
    if (!project) return;

    this.milestonesService.completeMilestone(project.id, milestone.id).subscribe({
      next: () => this.cdr.markForCheck(),
      error: (err) => {
        console.error('Failed to complete milestone', err);
        this.milestonesService.revertMilestoneStatus(milestone.id, milestone.status);
        this.cdr.markForCheck();
      },
    });
  }


  onDelete(milestone: Milestone, event: Event): void {
    event.stopPropagation();
    const project = this.detailService.project();
    if (!project || !confirm(`Are you sure you want to delete "${milestone.title}"?`)) return;

    this.milestonesService.deleteMilestone(project.id, milestone.id).subscribe({
      next: () => {
        // Close drawer if this milestone was being viewed
        if (this.selectedMilestone()?.id === milestone.id) {
          this.closeDetailDrawer();
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to delete milestone', err);
        // Reload to restore
        this.milestonesService.loadMilestones(project.id);
      },
    });
  }


  getStatusLabel(status: MilestoneStatus): string {
    const found = STATUS_OPTIONS.find(s => s.value === status);
    return found ? found.label : status;
  }

  getStatusColor(status: MilestoneStatus): string {
    const map: Record<MilestoneStatus, string> = {
      ACTIVE: 'var(--color-success)',
      IN_PROGRESS: 'var(--color-info)',
      ON_HOLD: 'var(--color-warning)',
      COMPLETED: 'var(--color-success)',
      CANCELLED: 'var(--color-danger)',
      ARCHIVED: 'var(--color-text-muted)',
    };
    return map[status] ?? 'var(--color-text-muted)';
  }

  getStatusBg(status: MilestoneStatus): string {
    return this.getStatusColor(status) + '18';
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return 'var(--color-success)';
    if (progress >= 40) return 'var(--color-warning)';
    return 'var(--color-primary)';
  }

  getRemainingDays(dueDate: string | null): string {
    if (!dueDate) return '';
    const end = new Date(dueDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1d remaining';
    return `${diffDays}d remaining`;
  }


  getMoreActions(milestone: Milestone): DropdownMenuItem[] {
    const actions: DropdownMenuItem[] = [
      { label: 'Edit Milestone', value: 'edit' }
    ];
    if (milestone.status !== 'COMPLETED') {
      actions.push({ label: 'Complete Milestone', value: 'complete' });
    }
    actions.push({ label: 'Delete Milestone', value: 'delete', danger: true, dividerBefore: true });
    return actions;
  }

  onMoreAction(item: DropdownMenuItem, milestone: Milestone): void {
    const dummyEvent = new Event('click');
    if (item.value === 'edit') {
      if (this.selectedMilestone()?.id === milestone.id) {
        this.closeDetailDrawer();
      }
      this.startEdit(milestone, dummyEvent);
    } else if (item.value === 'complete') {
      this.onComplete(milestone, dummyEvent);
    } else if (item.value === 'delete') {
      this.onDelete(milestone, dummyEvent);
    }
  }
}
