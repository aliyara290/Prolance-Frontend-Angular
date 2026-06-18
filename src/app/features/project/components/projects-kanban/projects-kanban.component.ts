import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DragDropModule } from 'primeng/dragdrop';
import { Project, ProjectStatus, ProjectPriority } from '../../types/project.model';

interface KanbanColumn {
  status: ProjectStatus;
  label: string;
}

interface AvatarData {
  initials: string;
  bg: string;
  color: string;
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

  dragStart(project: Project): void {
    this.draggedProject = project;
  }

  dragEnd(): void {
    this.draggedProject = null;
  }

  drop(targetStatus: ProjectStatus): void {
    if (this.draggedProject && this.draggedProject.status !== targetStatus) {
      this.statusChange.emit({
        project: this.draggedProject,
        newStatus: targetStatus
      });
    }
    this.draggedProject = null;
  }

  readonly columns: KanbanColumn[] = [
    { status: ProjectStatus.PLANNED, label: 'Planned' },
    { status: ProjectStatus.ACTIVE, label: 'Active' },
    { status: ProjectStatus.ON_HOLD, label: 'On Hold' },
    { status: ProjectStatus.COMPLETED, label: 'Completed' },
    { status: ProjectStatus.CANCELLED, label: 'Cancelled' },
  ];

  getColumnProjects(status: ProjectStatus): Project[] {
    return this.projects.filter(p => p.status === status);
  }

  getPriorityLabel(priority: ProjectPriority): string {
    const map: Record<ProjectPriority, string> = {
      HIGH: 'High',
      MEDIUM: 'Medium',
      LOW: 'Low',
    };
    return map[priority] ?? priority;
  }

  getRemainingDays(endDate: string | null): string {
    if (!endDate) return '';
    const end = new Date(endDate);
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
   * Generates avatar data for a project card.
   * Uses deterministic colors based on the project prefix.
   */
  getAvatarInitials(project: Project): AvatarData[] {
    const avatarColors: { bg: string; color: string }[] = [
      { bg: '#fef3c7', color: '#92400e' },
      { bg: '#dbeafe', color: '#1e40af' },
      { bg: '#f3e8ff', color: '#6b21a8' },
      { bg: '#dcfce7', color: '#166534' },
      { bg: '#fee2e2', color: '#991b1b' },
    ];

    const seed = project.prefix.charCodeAt(0) + project.prefix.charCodeAt(1);
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
  getAttachmentCount(project: Project): number {
    return (project.prefix.charCodeAt(0) % 5) + 1;
  }

  /**
   * Returns a deterministic comment count for display.
   * In production, this would come from the API response.
   */
  getCommentCount(project: Project): number {
    return (project.prefix.charCodeAt(1) % 5) + 1;
  }

  onCardClick(project: Project): void {
    this.viewProject.emit(project);
  }
}
