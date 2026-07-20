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
import { RouterModule } from '@angular/router';
import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from 'primeng/api';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { TasksService, UserDisplay } from '../../services/tasks.service';
import {
  TaskResponse,
  TaskStatus,
  TaskPriority,
  TaskType,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_STATUS_BG_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_TYPE_LABELS,
  TASK_TYPE_COLORS,
  ALL_TASK_STATUSES,
  ALL_TASK_PRIORITIES,
  ALL_TASK_TYPES,
} from '../../types/task.model';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-tasks-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    TagModule,
    SelectModule,
    InputTextModule,
    ButtonModule,
    SharedModule,
    DropdownMenuComponent,
  ],
  templateUrl: './tasks-table.component.html',
  styleUrls: ['./tasks-table.component.css'],
})
export class TasksTableComponent {
  private readonly tasksService = inject(TasksService);

  @Input({ required: true }) tasks: TaskResponse[] = [];
  @Input() totalCount = 0;
  @Input() projectId: string | null = null;

  @Output() viewTask = new EventEmitter<TaskResponse>();
  @Output() editTask = new EventEmitter<TaskResponse>();
  @Output() deleteTask = new EventEmitter<TaskResponse>();
  @Output() statusChange = new EventEmitter<{ task: TaskResponse; newStatus: TaskStatus }>();

  @ViewChild('dt') dt!: Table;

  readonly statusOptions: SelectOption[] = ALL_TASK_STATUSES.map(s => ({
    label: TASK_STATUS_LABELS[s],
    value: s,
  }));

  readonly priorityOptions: SelectOption[] = ALL_TASK_PRIORITIES.map(p => ({
    label: TASK_PRIORITY_LABELS[p],
    value: p,
  }));

  readonly typeOptions: SelectOption[] = ALL_TASK_TYPES.map(t => ({
    label: TASK_TYPE_LABELS[t],
    value: t,
  }));

  filterStatus: string | null = null;
  filterPriority: string | null = null;
  filterType: string | null = null;

  readonly moreActions: DropdownMenuItem[] = [
    { label: 'View Details', value: 'view' },
    { label: 'Edit Task', value: 'edit' },
    { label: 'Delete Task', value: 'delete', danger: true, dividerBefore: true },
  ];

  getStatusLabel(status: TaskStatus): string {
    return TASK_STATUS_LABELS[status] ?? status;
  }

  getStatusColor(status: TaskStatus): string {
    return TASK_STATUS_COLORS[status] ?? 'var(--color-text-muted)';
  }

  getStatusBg(status: TaskStatus): string {
    return TASK_STATUS_BG_COLORS[status] ?? 'var(--color-bg-muted)';
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

  getStatusSeverity(status: TaskStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<TaskStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      TODO: 'secondary',
      IN_PROGRESS: 'info',
      IN_REVIEW: 'warn',
      DONE: 'success',
      CANCELLED: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  getPrioritySeverity(priority: TaskPriority): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<TaskPriority, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      LOW: 'info',
      MEDIUM: 'warn',
      HIGH: 'danger',
      URGENT: 'danger',
    };
    return map[priority] ?? 'secondary';
  }

  getUserDisplay(userId: string | null | undefined): UserDisplay {
    return this.tasksService.getUserDisplay(userId);
  }

  getAssigneeDisplays(task: TaskResponse): UserDisplay[] {
    if (!task.assignments || task.assignments.length === 0) return [];
    return task.assignments.map(a => this.getUserDisplay(a.userId));
  }

  clearFilters(): void {
    this.filterStatus = null;
    this.filterPriority = null;
    this.filterType = null;
    this.dt.clear();
  }

  onMoreAction(item: DropdownMenuItem, task: TaskResponse): void {
    switch (item.value) {
      case 'view':
        this.viewTask.emit(task);
        break;
      case 'edit':
        this.editTask.emit(task);
        break;
      case 'delete':
        this.deleteTask.emit(task);
        break;
    }
  }
}
