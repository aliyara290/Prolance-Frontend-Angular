import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown, ChevronRight, X, SlidersHorizontal } from 'lucide-angular';
import {
  TaskStatus,
  TaskPriority,
  TaskType,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_TYPE_LABELS,
  ALL_TASK_STATUSES,
  ALL_TASK_PRIORITIES,
  ALL_TASK_TYPES,
} from '../../types/task.model';
import { ProjectsNames } from '../../../project/types/project.model';

export interface TaskFilters {
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  types: TaskType[];
  dueDateFilter: 'all' | 'overdue' | 'today' | 'week';
  projectId: string | null;
}

@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './task-filters.component.html',
})
export class TaskFiltersComponent implements OnChanges {
  @Input() projects: ProjectsNames[] = [];
  @Input() selectedProjectId: string | null = null;
  @Output() filtersChanged = new EventEmitter<TaskFilters>();
  @Output() projectSelected = new EventEmitter<string | null>();

  icons = {
    chevronDown: ChevronDown,
    chevronRight: ChevronRight,
    x: X,
    filters: SlidersHorizontal,
  };

  // Section collapse state
  readonly statusOpen = signal(false);
  readonly priorityOpen = signal(false);
  readonly typeOpen = signal(false);
  readonly dueDateOpen = signal(true);

  // Filter selections
  readonly selectedStatuses = signal<Set<TaskStatus>>(new Set());
  readonly selectedPriorities = signal<Set<TaskPriority>>(new Set());
  readonly selectedTypes = new Set<TaskType>();
  readonly selectedTypes$ = signal<Set<TaskType>>(new Set());
  readonly dueDateFilter = signal<'all' | 'overdue' | 'today' | 'week'>('all');

  // Expose constants to template
  readonly allStatuses = ALL_TASK_STATUSES;
  readonly allPriorities = ALL_TASK_PRIORITIES;
  readonly allTypes = ALL_TASK_TYPES;
  readonly statusLabels = TASK_STATUS_LABELS;
  readonly statusColors = TASK_STATUS_COLORS;
  readonly priorityLabels = TASK_PRIORITY_LABELS;
  readonly priorityColors = TASK_PRIORITY_COLORS;
  readonly typeLabels = TASK_TYPE_LABELS;

  readonly activeFilterCount = computed(() => {
    return (
      this.selectedStatuses().size +
      this.selectedPriorities().size +
      this.selectedTypes$().size +
      (this.dueDateFilter() !== 'all' ? 1 : 0) +
      (this.selectedProjectId ? 1 : 0)
    );
  });

  ngOnChanges(_changes: SimpleChanges): void {}

  toggleStatus(status: TaskStatus): void {
    const set = new Set(this.selectedStatuses());
    if (set.has(status)) set.delete(status);
    else set.add(status);
    this.selectedStatuses.set(set);
    this.emit();
  }

  togglePriority(priority: TaskPriority): void {
    const set = new Set(this.selectedPriorities());
    if (set.has(priority)) set.delete(priority);
    else set.add(priority);
    this.selectedPriorities.set(set);
    this.emit();
  }

  toggleType(type: TaskType): void {
    const set = new Set(this.selectedTypes$());
    if (set.has(type)) set.delete(type);
    else set.add(type);
    this.selectedTypes$.set(set);
    this.emit();
  }

  setDueDate(filter: 'all' | 'overdue' | 'today' | 'week'): void {
    this.dueDateFilter.set(filter);
    this.emit();
  }

  onProjectClick(projectId: string): void {
    if (this.selectedProjectId === projectId) {
      this.projectSelected.emit(null);
    } else {
      this.projectSelected.emit(projectId);
    }
    this.emit();
  }

  clearAll(): void {
    this.selectedStatuses.set(new Set());
    this.selectedPriorities.set(new Set());
    this.selectedTypes$.set(new Set());
    this.dueDateFilter.set('all');
    this.projectSelected.emit(null);
    this.emit();
  }

  private emit(): void {
    this.filtersChanged.emit({
      statuses: Array.from(this.selectedStatuses()),
      priorities: Array.from(this.selectedPriorities()),
      types: Array.from(this.selectedTypes$()),
      dueDateFilter: this.dueDateFilter(),
      projectId: this.selectedProjectId,
    });
  }
}
