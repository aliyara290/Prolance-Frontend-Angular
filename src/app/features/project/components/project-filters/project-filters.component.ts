import {
  Component,
  Output,
  EventEmitter,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown, ChevronRight, X, SlidersHorizontal } from 'lucide-angular';
import {
  ProjectStatus,
  ProjectPriority,
} from '../../types/project.model';

export interface ProjectFilters {
  statuses: ProjectStatus[];
  priorities: ProjectPriority[];
  dueDateFilter: 'all' | 'overdue' | 'today' | 'week';
}

@Component({
  selector: 'app-project-filters',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './project-filters.component.html',
})
export class ProjectFiltersComponent {
  @Output() filtersChanged = new EventEmitter<ProjectFilters>();

  icons = {
    chevronDown: ChevronDown,
    chevronRight: ChevronRight,
    x: X,
    filters: SlidersHorizontal,
  };

  // Section collapse state
  readonly statusOpen = signal(false);
  readonly priorityOpen = signal(false);
  readonly dueDateOpen = signal(true);

  // Filter selections
  readonly selectedStatuses = signal<Set<ProjectStatus>>(new Set());
  readonly selectedPriorities = signal<Set<ProjectPriority>>(new Set());
  readonly dueDateFilter = signal<'all' | 'overdue' | 'today' | 'week'>('all');

  // Expose constants
  readonly allStatuses = Object.values(ProjectStatus);
  readonly allPriorities = Object.values(ProjectPriority);
  
  readonly statusLabels: Record<ProjectStatus, string> = {
    [ProjectStatus.PLANNED]: 'Planned',
    [ProjectStatus.ACTIVE]: 'Active',
    [ProjectStatus.ON_HOLD]: 'On Hold',
    [ProjectStatus.COMPLETED]: 'Completed',
    [ProjectStatus.CANCELLED]: 'Cancelled'
  };

  readonly priorityLabels: Record<ProjectPriority, string> = {
    [ProjectPriority.LOW]: 'Low',
    [ProjectPriority.MEDIUM]: 'Medium',
    [ProjectPriority.HIGH]: 'High'
  };

  readonly priorityColors: Record<ProjectPriority, string> = {
    [ProjectPriority.LOW]: '#10b981',
    [ProjectPriority.MEDIUM]: '#f59e0b',
    [ProjectPriority.HIGH]: '#ef4444'
  };

  readonly activeFilterCount = computed(() => {
    return (
      this.selectedStatuses().size +
      this.selectedPriorities().size +
      (this.dueDateFilter() !== 'all' ? 1 : 0)
    );
  });

  toggleStatus(status: ProjectStatus): void {
    const set = new Set(this.selectedStatuses());
    if (set.has(status)) set.delete(status);
    else set.add(status);
    this.selectedStatuses.set(set);
    this.emit();
  }

  togglePriority(priority: ProjectPriority): void {
    const set = new Set(this.selectedPriorities());
    if (set.has(priority)) set.delete(priority);
    else set.add(priority);
    this.selectedPriorities.set(set);
    this.emit();
  }

  setDueDate(filter: 'all' | 'overdue' | 'today' | 'week'): void {
    this.dueDateFilter.set(filter);
    this.emit();
  }

  clearAll(): void {
    this.selectedStatuses.set(new Set());
    this.selectedPriorities.set(new Set());
    this.dueDateFilter.set('all');
    this.emit();
  }

  private emit(): void {
    this.filtersChanged.emit({
      statuses: Array.from(this.selectedStatuses()),
      priorities: Array.from(this.selectedPriorities()),
      dueDateFilter: this.dueDateFilter(),
    });
  }
}
