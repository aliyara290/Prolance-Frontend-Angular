import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { TasksService, UserDisplay } from '../../services/tasks.service';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import {
  TaskResponse,
  TaskStatus,
  TaskPriority,
  TaskType,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_TYPE_LABELS,
  TASK_TYPE_COLORS,
} from '../../types/task.model';

interface KanbanColumn {
  status: TaskStatus;
  label: string;
}

@Component({
  selector: 'app-tasks-kanban',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DragDropModule, DropdownMenuComponent],
  templateUrl: './tasks-kanban.component.html',
  styleUrls: ['./tasks-kanban.component.css'],
})
export class TasksKanbanComponent {
  private readonly tasksService = inject(TasksService);

  @Input({ required: true }) tasks: TaskResponse[] = [];

  @Output() viewTask = new EventEmitter<TaskResponse>();
  @Output() statusChange = new EventEmitter<{ task: TaskResponse; newStatus: TaskStatus }>();
  @Output() editTask = new EventEmitter<TaskResponse>();
  @Output() deleteTask = new EventEmitter<TaskResponse>();

  draggedTask: TaskResponse | null = null;

  cardMenuItems: DropdownMenuItem[] = [
    {
      label: 'Edit task',
      value: 'edit',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>'
    },
    {
      label: 'Delete task',
      value: 'delete',
      danger: true,
      dividerBefore: true,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>'
    }
  ];

  readonly columns: KanbanColumn[] = [
    { status: TaskStatus.TODO, label: 'To Do' },
    { status: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { status: TaskStatus.IN_REVIEW, label: 'In Review' },
    { status: TaskStatus.DONE, label: 'Done' },
    { status: TaskStatus.CANCELLED, label: 'Cancelled' },
  ];

  getColumnTasks(status: TaskStatus): TaskResponse[] {
    return this.tasks.filter(t => t.status === status);
  }

  dragStart(task: TaskResponse): void {
    this.draggedTask = task;
  }

  dragEnd(): void {
    this.draggedTask = null;
  }

  drop(targetStatus: TaskStatus): void {
    if (this.draggedTask && this.draggedTask.status !== targetStatus) {
      this.statusChange.emit({
        task: this.draggedTask,
        newStatus: targetStatus,
      });
    }
    this.draggedTask = null;
  }

  onCardClick(task: TaskResponse): void {
    this.viewTask.emit(task);
  }

  getPriorityLabel(priority: TaskPriority): string {
    return TASK_PRIORITY_LABELS[priority] ?? priority;
  }

  getPriorityColor(priority: TaskPriority): string {
    return TASK_PRIORITY_COLORS[priority] ?? 'var(--color-text-muted)';
  }

  getTypeLabel(type: TaskType): string {
    return TASK_TYPE_LABELS[type] ?? type;
  }

  getTypeColor(type: TaskType): string {
    return TASK_TYPE_COLORS[type] ?? 'var(--color-text-muted)';
  }

  getUserDisplay(userId: string | null | undefined): UserDisplay {
    return this.tasksService.getUserDisplay(userId);
  }

  getAssigneeDisplays(task: TaskResponse): UserDisplay[] {
    if (!task.assignments || task.assignments.length === 0) return [];
    return task.assignments.slice(0, 3).map(a => this.getUserDisplay(a.userId));
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

  isOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false;
    return new Date(dueDate).getTime() < new Date().getTime();
  }

  onMenuItemClick(item: DropdownMenuItem, task: TaskResponse): void {
    if (item.value === 'edit') {
      this.editTask.emit(task);
    } else if (item.value === 'delete') {
      this.deleteTask.emit(task);
    }
  }
}
