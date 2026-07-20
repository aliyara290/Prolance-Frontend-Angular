import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Milestone, MilestoneStatus } from '../../types/milestone.model';
import { Pencil, Trash2, X, Calendar, Layers, AlignLeft, CheckCircle, Clock, LucideAngularModule } from 'lucide-angular';
import { MilestoneService } from '../../services/milestone.service';
import { TaskResponse } from '../../../task/types/task.model';
import { TasksService } from '../../../task/services/tasks.service';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-milestone-detail-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule, DropdownMenuComponent],
  templateUrl: './milestone-detail-panel.component.html',
  styleUrls: ['./milestone-detail-panel.component.css'],
})
export class MilestoneDetailPanelComponent implements OnChanges {
  private readonly milestoneService = inject(MilestoneService);
  private readonly tasksService = inject(TasksService);

  @Input() milestone: Milestone | null = null;
  @Input() isOpen = false;

  @Output() closePanel = new EventEmitter<void>();
  @Output() editMilestone = new EventEmitter<Milestone>();
  @Output() milestoneUpdated = new EventEmitter<void>();

  readonly activeSection = signal<'details' | 'tasks'>('details');
  readonly tasks = signal<TaskResponse[]>([]);
  readonly loadingTasks = signal<boolean>(false);

  readonly icons = {
    pencil: Pencil,
    trash2: Trash2,
    x: X,
    calendar: Calendar,
    layers: Layers,
    alignLeft: AlignLeft,
    checkCircle: CheckCircle,
    clock: Clock
  };

  readonly statusOptions: MilestoneStatus[] = [
    'ACTIVE',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED',
    'ARCHIVED'
  ];

  readonly panelMenuItems: DropdownMenuItem[] = [
    { label: 'Edit Milestone', value: 'edit', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>' },
    { label: 'Delete Milestone', value: 'delete', danger: true, dividerBefore: true, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>' }
  ];

  onMenuItemClick(item: DropdownMenuItem): void {
    if (!this.milestone) return;
    switch (item.value) {
      case 'edit':
        this.editMilestone.emit(this.milestone);
        break;
      case 'delete':
        this.deleteMilestone();
        break;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (!this.isOpen) {
        this.activeSection.set('details');
        this.tasks.set([]);
      } else if (this.activeSection() === 'tasks') {
        this.loadTasks();
      }
    }
    
    if (changes['milestone'] && this.milestone && this.isOpen && this.activeSection() === 'tasks') {
       this.loadTasks();
    }
  }

  setSection(section: 'details' | 'tasks'): void {
    this.activeSection.set(section);
    if (section === 'tasks' && this.milestone) {
      this.loadTasks();
    }
  }

  private loadTasks(): void {
    if (!this.milestone) return;
    this.loadingTasks.set(true);
    this.tasksService.getTasksByMilestone(this.milestone.id).subscribe({
      next: (res) => {
        this.tasks.set(res.data || []);
        this.loadingTasks.set(false);
      },
      error: (err) => {
        console.error('Failed to load milestone tasks', err);
        this.loadingTasks.set(false);
      }
    });
  }

  onClose(): void {
    this.closePanel.emit();
    this.activeSection.set('details');
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('panel-backdrop')) {
      this.onClose();
    }
  }

  deleteMilestone(): void {
    if (!this.milestone || !confirm(`Are you sure you want to delete milestone "${this.milestone.title}"?`)) return;

    this.milestoneService.deleteMilestone(this.milestone.projectId, this.milestone.id).subscribe({
      next: () => {
        this.milestoneUpdated.emit();
        this.onClose();
      },
      error: (err) => console.error('Failed to delete milestone', err),
    });
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  getStatusColor(status: MilestoneStatus): string {
    switch(status) {
      case 'COMPLETED': return 'var(--color-success)';
      case 'ACTIVE': case 'IN_PROGRESS': return 'var(--color-primary)';
      case 'ON_HOLD': return 'var(--color-warning)';
      case 'CANCELLED': case 'ARCHIVED': return 'var(--color-text-muted)';
      default: return 'var(--color-text-muted)';
    }
  }

  getStatusBg(status: MilestoneStatus): string {
    switch(status) {
      case 'COMPLETED': return 'var(--color-success-soft)';
      case 'ACTIVE': case 'IN_PROGRESS': return 'var(--color-primary-soft)';
      case 'ON_HOLD': return 'var(--color-warning-soft)';
      case 'CANCELLED': case 'ARCHIVED': return 'var(--color-bg-muted)';
      default: return 'var(--color-bg-muted)';
    }
  }

  getTaskStatusColor(status: string): string {
    switch(status) {
      case 'DONE': return 'var(--color-success)';
      case 'IN_PROGRESS': return 'var(--color-primary)';
      case 'IN_REVIEW': return 'var(--color-warning)';
      case 'TODO': default: return 'var(--color-text-muted)';
    }
  }

  getTaskStatusBg(status: string): string {
    switch(status) {
      case 'DONE': return 'var(--color-success-soft)';
      case 'IN_PROGRESS': return 'var(--color-primary-soft)';
      case 'IN_REVIEW': return 'var(--color-warning-soft)';
      case 'TODO': default: return 'var(--color-bg-muted)';
    }
  }
}
