import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { RouterModule } from '@angular/router';
import { Milestone, MilestoneStatus } from '../../types/milestone.model';

interface AvatarData {
  initials: string;
  bg: string;
  color: string;
}

interface KanbanColumn {
  status: MilestoneStatus;
  label: string;
  milestones: Milestone[];
}

@Component({
  selector: 'app-milestone-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule, RouterModule],
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
   * Uses deterministic colors based on the milestone title.
   */
  getAvatarInitials(milestone: Milestone): AvatarData[] {
    const avatarColors: { bg: string; color: string }[] = [
      { bg: '#fef3c7', color: '#92400e' },
      { bg: '#dbeafe', color: '#1e40af' },
      { bg: '#f3e8ff', color: '#6b21a8' },
      { bg: '#dcfce7', color: '#166534' },
      { bg: '#fee2e2', color: '#991b1b' },
    ];

    const seed = milestone.title.charCodeAt(0) + (milestone.title.charCodeAt(1) || 0);
    const count = 2 + (seed % 3); // 2–4 avatars
    const avatars: AvatarData[] = [];

    for (let i = 0; i < count; i++) {
      const colorIndex = (seed + i) % avatarColors.length;
      const charCode = 65 + ((seed + i * 7) % 26);
      avatars.push({
        initials: String.fromCharCode(charCode),
        bg: avatarColors[colorIndex].bg,
        color: avatarColors[colorIndex].color,
      });
    }
    return avatars;
  }

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
}
