import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { RouterModule } from '@angular/router';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { Milestone, MilestoneStatus } from '../../types/milestone.model';

interface KanbanColumn {
  status: MilestoneStatus;
  label: string;
  milestones: Milestone[];
}

@Component({
  selector: 'app-milestone-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule, RouterModule, DropdownMenuComponent],
  templateUrl: './milestone-kanban.component.html',
  styleUrls: ['./milestone-kanban.component.css']
})
export class MilestoneKanbanComponent {
  @Input() set milestones(value: Milestone[]) {
    this._milestones.set(value);
  }
  @Input() loading: boolean = false;

  @Output() view = new EventEmitter<Milestone>();
  @Output() statusChange = new EventEmitter<{ milestone: Milestone; newStatus: MilestoneStatus }>();
  @Output() editMilestone = new EventEmitter<Milestone>();
  @Output() deleteMilestone = new EventEmitter<Milestone>();

  cardMenuItems: DropdownMenuItem[] = [
    {
      label: 'Edit milestone',
      value: 'edit',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>'
    },
    {
      label: 'Delete milestone',
      value: 'delete',
      danger: true,
      dividerBefore: true,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>'
    }
  ];

  private _milestones = signal<Milestone[]>([]);

  readonly columns = computed<KanbanColumn[]>(() => {
    const list = this._milestones();
    return [
      {
        status: 'ACTIVE',
        label: 'Active',
        milestones: list.filter(m => m.status === 'ACTIVE'),
      },
      {
        status: 'IN_PROGRESS',
        label: 'In Progress',
        milestones: list.filter(m => m.status === 'IN_PROGRESS'),
      },
      {
        status: 'ON_HOLD',
        label: 'On Hold',
        milestones: list.filter(m => m.status === 'ON_HOLD'),
      },
      {
        status: 'COMPLETED',
        label: 'Completed',
        milestones: list.filter(m => m.status === 'COMPLETED'),
      },
      {
        status: 'CANCELLED',
        label: 'Cancelled',
        milestones: list.filter(m => m.status === 'CANCELLED'),
      },
      {
        status: 'ARCHIVED',
        label: 'Archived',
        milestones: list.filter(m => m.status === 'ARCHIVED'),
      }
    ];
  });

  draggedMilestone: Milestone | null = null;

  dragStart(milestone: Milestone): void {
    this.draggedMilestone = milestone;
  }

  dragEnd(): void {
    this.draggedMilestone = null;
  }

  drop(targetStatus: MilestoneStatus): void {
    if (this.draggedMilestone && this.draggedMilestone.status !== targetStatus) {
      this.statusChange.emit({
        milestone: this.draggedMilestone,
        newStatus: targetStatus
      });
    }
    this.draggedMilestone = null;
  }

  onView(milestone: Milestone, event: Event): void {
    event.preventDefault();
    this.view.emit(milestone);
  }

  getStatusLabel(status: MilestoneStatus): string {
    const map: Record<MilestoneStatus, string> = {
      'ACTIVE': 'Active',
      'IN_PROGRESS': 'In Progress',
      'ON_HOLD': 'On Hold',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled',
      'ARCHIVED': 'Archived',
    };
    return map[status] ?? status;
  }

  getRemainingDays(dueDate: string | null): string {
    if (!dueDate) return '';
    const end = new Date(dueDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} Days Overdue`;
    }
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return '1 Day Remaining';
    return `${diffDays} Days Remaining`;
  }

  /**
   * Generates avatar data for a milestone card.
   * This was removed because we use a progress bar instead.
   */

  /**
   * Returns a deterministic attachment count for display.
   * In production, this would come from the API response.
   */
  getAttachmentCount(milestone: Milestone): number {
    return (milestone.title.charCodeAt(0) % 5) + 1;
  }

  /**
   * Returns a deterministic comment count for display.
   * In production, this would come from the API response.
   */
  getCommentCount(milestone: Milestone): number {
    return (milestone.title.charCodeAt(1) || 0) % 5 + 1;
  }

  onMenuItemClick(item: DropdownMenuItem, milestone: Milestone): void {
    if (item.value === 'edit') {
      this.editMilestone.emit(milestone);
    } else if (item.value === 'delete') {
      this.deleteMilestone.emit(milestone);
    }
  }
}
