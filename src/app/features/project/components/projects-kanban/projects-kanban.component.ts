import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DragDropModule } from 'primeng/dragdrop';
import { Project, ProjectStatus, ProjectPriority } from '../../types/project.model';

interface KanbanColumn {
  status: ProjectStatus;
  label: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

@Component({
  selector: 'app-projects-kanban',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, DragDropModule],
  templateUrl: './projects-kanban.component.html',
  styleUrls: ['./projects-kanban.component.css'],
})
export class ProjectsKanbanComponent {
  @Input({ required: true }) projects: Project[] = [];

  @Output() viewProject = new EventEmitter<Project>();
  @Output() editProject = new EventEmitter<Project>();
  @Output() statusChange = new EventEmitter<{ project: Project; newStatus: ProjectStatus }>();

  draggedProject: Project | null = null;

  dragStart(project: Project) {
    this.draggedProject = project;
  }

  dragEnd() {
    this.draggedProject = null;
  }

  drop(targetStatus: ProjectStatus) {
    if (this.draggedProject && this.draggedProject.status !== targetStatus) {
      this.statusChange.emit({
        project: this.draggedProject,
        newStatus: targetStatus
      });
    }
    this.draggedProject = null;
  }

  readonly columns: KanbanColumn[] = [
    {
      status: ProjectStatus.PLANNED,
      label: 'Planned',
      color: 'var(--color-info)',
      borderColor: 'var(--color-info)',
      bgColor: 'var(--color-info)',
    },
    {
      status: ProjectStatus.ACTIVE,
      label: 'Active',
      color: 'var(--color-success)',
      borderColor: 'var(--color-success)',
      bgColor: 'var(--color-success)',
    },
    {
      status: ProjectStatus.ON_HOLD,
      label: 'On Hold',
      color: 'var(--color-warning)',
      borderColor: 'var(--color-warning)',
      bgColor: 'var(--color-warning)',
    },
    {
      status: ProjectStatus.COMPLETED,
      label: 'Completed',
      color: 'var(--color-text-muted)',
      borderColor: 'var(--color-text-muted)',
      bgColor: 'var(--color-text-muted)',
    },
    {
      status: ProjectStatus.CANCELLED,
      label: 'Cancelled',
      color: 'var(--color-danger)',
      borderColor: 'var(--color-danger)',
      bgColor: 'var(--color-danger)',
    },
  ];

  getColumnProjects(status: ProjectStatus): Project[] {
    return this.projects.filter(p => p.status === status);
  }

  getPriorityColor(priority: ProjectPriority): string {
    const map: Record<ProjectPriority, string> = {
      HIGH: 'var(--color-danger)',
      MEDIUM: 'var(--color-warning)',
      LOW: 'var(--color-success)',
    };
    return map[priority] ?? 'var(--color-text-muted)';
  }

  getPriorityLabel(priority: ProjectPriority): string {
    const map: Record<ProjectPriority, string> = {
      HIGH: 'High',
      MEDIUM: 'Medium',
      LOW: 'Low',
    };
    return map[priority] ?? priority;
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return 'var(--color-success)';
    if (progress >= 40) return 'var(--color-warning)';
    return 'var(--color-primary)';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  onCardClick(project: Project): void {
    this.viewProject.emit(project);
  }
}
