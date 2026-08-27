import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown, ChevronRight, X, SlidersHorizontal } from 'lucide-angular';
import { MilestoneStatus } from '../../types/milestone.model';
import { ProjectsNames } from '../../../project/types/project.model';

export interface MilestoneFilters {
  statuses: MilestoneStatus[];
  dueDateFilter: 'all' | 'overdue' | 'today' | 'week';
  projectId: string | null;
}

@Component({
  selector: 'app-milestone-filters',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './milestone-filters.component.html',
})
export class MilestoneFiltersComponent {
  @Input() projects: ProjectsNames[] = [];
  @Input() selectedProjectId: string | null = null;
  @Output() filtersChanged = new EventEmitter<MilestoneFilters>();
  @Output() projectSelected = new EventEmitter<string | null>();

  icons = {
    chevronDown: ChevronDown,
    chevronRight: ChevronRight,
    x: X,
    filters: SlidersHorizontal,
  };

  readonly statusOpen = signal(false);
  readonly dueDateOpen = signal(true);
  readonly projectsOpen = signal(true);

  readonly selectedStatuses = signal<Set<MilestoneStatus>>(new Set());
  readonly dueDateFilter = signal<'all' | 'overdue' | 'today' | 'week'>('all');

  readonly allStatuses: MilestoneStatus[] = [
    'ACTIVE',
    'IN_PROGRESS',
    'ARCHIVED',
    'ON_HOLD',
    'CANCELLED',
    'COMPLETED'
  ];

  readonly statusLabels: Record<MilestoneStatus, string> = {
    'ACTIVE': 'Active',
    'IN_PROGRESS': 'In Progress',
    'ARCHIVED': 'Archived',
    'ON_HOLD': 'On Hold',
    'CANCELLED': 'Cancelled',
    'COMPLETED': 'Completed'
  };

  readonly activeFilterCount = computed(() => {
    return (
      this.selectedStatuses().size +
      (this.dueDateFilter() !== 'all' ? 1 : 0) +
      (this.selectedProjectId ? 1 : 0)
    );
  });

  toggleStatus(status: MilestoneStatus): void {
    const set = new Set(this.selectedStatuses());
    if (set.has(status)) set.delete(status);
    else set.add(status);
    this.selectedStatuses.set(set);
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
  }

  clearAll(): void {
    this.selectedStatuses.set(new Set());
    this.dueDateFilter.set('all');
    this.projectSelected.emit(null);
    this.emit();
  }

  private emit(): void {
    this.filtersChanged.emit({
      statuses: Array.from(this.selectedStatuses()),
      dueDateFilter: this.dueDateFilter(),
      projectId: this.selectedProjectId,
    });
  }
}
