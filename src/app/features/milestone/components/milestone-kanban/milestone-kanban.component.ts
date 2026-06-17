import { Component, EventEmitter, Input, Output, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { RouterModule } from '@angular/router';
import { Milestone, MilestoneStatus } from '../../types/milestone.model';

interface KanbanColumn {
  status: MilestoneStatus;
  label: string;
  milestones: Milestone[];
  colorClass: string;
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
        colorClass: '!border-emerald-500',
      },
      {
        status: 'IN_PROGRESS',
        label: 'In Progress',
        milestones: list.filter(m => m.status === 'IN_PROGRESS'),
        colorClass: '!border-blue-500',
      },
      {
        status: 'ON_HOLD',
        label: 'On Hold',
        milestones: list.filter(m => m.status === 'ON_HOLD'),
        colorClass: '!border-amber-500',
      },
      {
        status: 'COMPLETED',
        label: 'Completed',
        milestones: list.filter(m => m.status === 'COMPLETED'),
        colorClass: '!border-green-600',
      },
      {
        status: 'CANCELLED',
        label: 'Cancelled',
        milestones: list.filter(m => m.status === 'CANCELLED'),
        colorClass: '!border-red-500',
      },
      {
        status: 'ARCHIVED',
        label: 'Archived',
        milestones: list.filter(m => m.status === 'ARCHIVED'),
        colorClass: '!border-slate-400',
      }
    ];
  });

  draggedMilestone: Milestone | null = null;

  dragStart(milestone: Milestone) {
    this.draggedMilestone = milestone;

  }

  dragEnd() {
    this.draggedMilestone = null;
  }

  drop(targetStatus: MilestoneStatus) {
    if (this.draggedMilestone && this.draggedMilestone.status !== targetStatus) {
      this.statusChange.emit({
        milestone: this.draggedMilestone,
        newStatus: targetStatus
      });
    }
    this.draggedMilestone = null;
  }

  onView(milestone: Milestone, event: Event): void {
    // Prevent navigation if clicking card, we emit view event
    event.preventDefault();
    this.view.emit(milestone);
  }
}
