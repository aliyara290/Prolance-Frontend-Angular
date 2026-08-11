import {
  Component,
  Input,
  inject,
  signal,
  computed,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TasksService } from '../../services/tasks.service';
import { ProjectsService } from '../../../project/services/projects.service';
import { TasksKanbanComponent } from '../../components/tasks-kanban/tasks-kanban.component';
import { TaskDetailPanelComponent } from '../../components/task-detail-panel/task-detail-panel.component';
import { TaskFormModalComponent } from '../../components/task-form-modal/task-form-modal.component';
import { TaskFiltersComponent, TaskFilters } from '../../components/task-filters/task-filters.component';
import { KanbanSkeletonComponent } from '../../../../shared/ui/skeletons/kanban-skeleton/kanban-skeleton.component';
import { TaskResponse, TaskStatus, TaskPriority, TaskType, ChangeTaskStatusRequest } from '../../types/task.model';
import { LucideAngularModule, PanelLeftClose, PanelLeftOpen, RefreshCw } from 'lucide-angular';
import {ErrorMessageComponent} from '../../../../shared/ui/error-message/error-message.component';

import { ConfirmModalService } from '../../../../shared/ui/confirm-modal/confirm-modal.service';

@Component({
  selector: 'app-tasks-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LucideAngularModule,
    TasksKanbanComponent,
    TaskDetailPanelComponent,
    TaskFormModalComponent,
    TaskFiltersComponent,
    KanbanSkeletonComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './tasks-list-page.component.html',
})
export class TasksListPageComponent implements OnInit, OnChanges {
  private readonly tasksService = inject(TasksService);
  private readonly projectsService = inject(ProjectsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmService = inject(ConfirmModalService);

  /** When provided (from project context), scopes tasks to a specific project. */
  @Input() projectId: string | null = null;

  readonly tasks = this.tasksService.tasks;
  readonly loading = this.tasksService.loading;
  readonly error = this.tasksService.error;
  readonly totalCount = this.tasksService.totalCount;

  readonly projects = this.projectsService.projectNames;

  readonly activeTabId = signal<string>('all');

  // ── Sidebar ──
  readonly sidebarVisible = signal<boolean>(true);

  // ── Filters ──
  readonly activeFilters = signal<TaskFilters>({
    statuses: [],
    priorities: [],
    types: [],
    dueDateFilter: 'all',
    projectId: null,
  });

  // ── Project scope (from sidebar click) ──
  readonly scopedProjectId = signal<string | null>(null);

  // ── Filtered tasks (derived) ──
  readonly filteredTasks = computed<TaskResponse[]>(() => {
    const filters = this.activeFilters();
    const scopeId = this.scopedProjectId() ?? this.projectId;
    let result = this.tasks();

    // Scope to project
    if (scopeId) {
      result = result.filter(t => t.projectId === scopeId);
    }

    // Status filter
    if (filters.statuses.length > 0) {
      result = result.filter(t => filters.statuses.includes(t.status as TaskStatus));
    }

    // Priority filter
    if (filters.priorities.length > 0) {
      result = result.filter(t => filters.priorities.includes(t.priority as TaskPriority));
    }

    // Type filter
    if (filters.types.length > 0) {
      result = result.filter(t => filters.types.includes(t.type as TaskType));
    }

    // Due date filter
    if (filters.dueDateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7);

      result = result.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        if (filters.dueDateFilter === 'overdue') return due < today;
        if (filters.dueDateFilter === 'today') return due >= today && due <= endOfToday;
        if (filters.dueDateFilter === 'week') return due >= today && due <= endOfWeek;
        return true;
      });
    }

    return result;
  });

  // ── Detail Panel ──
  readonly selectedTask = signal<TaskResponse | null>(null);
  readonly panelOpen = signal(false);

  // ── Form Modal ──
  readonly createPanelOpen = signal(false);
  readonly editTaskId = signal<string | null>(null);

  readonly icons = {
    panelClose: PanelLeftClose,
    panelOpen: PanelLeftOpen,
    refresh: RefreshCw,
  };



  ngOnInit(): void {
    this.loadTasks();
    this.projectsService.loadProjectNames();

    this.route.queryParams.subscribe(params => {
      const taskId = params['taskId'];
      if (taskId) {
        if (this.selectedTask()?.id !== taskId) {
          this.tasksService.getTask(taskId).subscribe({
            next: (res) => {
              if (res.success && res.data) {
                this.selectedTask.set(res.data);
                this.panelOpen.set(true);
              }
            },
            error: (err) => console.error('Failed to load task from URL', err)
          });
        }
      } else {
        if (this.panelOpen()) {
          this.panelOpen.set(false);
          this.selectedTask.set(null);
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && !changes['projectId'].firstChange) {
      this.loadTasks();
    }
  }

  private loadTasks(): void {
    if (this.projectId) {
      this.tasksService.loadTasks(this.projectId);
    } else {
      this.tasksService.loadAllTasks();
    }
  }

  onRefresh(): void {
    this.loadTasks();
  }

  // onTabChange(tab: ModuleTab): void {
  //   this.activeTabId.set(tab.id);
  // }

  onCreate(): void {
    this.createPanelOpen.set(true);
  }

  onCloseCreatePanel(): void {
    this.createPanelOpen.set(false);
    this.editTaskId.set(null);
  }

  onFiltersChanged(filters: TaskFilters): void {
    this.activeFilters.set(filters);
  }

  onProjectSelected(projectId: string | null): void {
    this.scopedProjectId.set(projectId);
    if (projectId) {
      // Reload tasks for the selected project
      this.tasksService.loadTasks(projectId);
    } else if (!this.projectId) {
      this.tasksService.loadAllTasks();
    }
  }

  toggleSidebar(): void {
    this.sidebarVisible.update(v => !v);
  }

  // ── Task Actions ──

  onViewTask(task: TaskResponse): void {
    this.selectedTask.set(task);
    this.panelOpen.set(true);
    this.router.navigate([], { relativeTo: this.route, queryParams: { taskId: task.id }, queryParamsHandling: 'merge' });
  }

  onEditTask(task: TaskResponse): void {
    this.panelOpen.set(false);
    this.router.navigate([], { relativeTo: this.route, queryParams: { taskId: null }, queryParamsHandling: 'merge' });
    this.editTaskId.set(task.id);
    this.createPanelOpen.set(true);
  }

  async onDeleteTask(task: TaskResponse): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Task',
      message: `Are you sure you want to delete task "${task.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });
    
    if (!confirmed) return;

    this.tasksService.deleteTask(task.id).subscribe({
      next: () => {
        this.panelOpen.set(false);
        this.selectedTask.set(null);
        this.router.navigate([], { relativeTo: this.route, queryParams: { taskId: null }, queryParamsHandling: 'merge' });
      },
      error: (err) => {
        console.error('Failed to delete task', err);
        this.loadTasks();
      },
    });
  }

  onStatusChange(event: { task: TaskResponse; newStatus: TaskStatus }): void {
    const payload: ChangeTaskStatusRequest = { newStatus: event.newStatus };
    this.tasksService.changeTaskStatus(event.task.id, payload).subscribe({
      error: (err) => {
        console.error('Failed to change task status', err);
        this.loadTasks();
      },
    });
  }

  onClosePanel(): void {
    this.panelOpen.set(false);
    this.selectedTask.set(null);
    this.router.navigate([], { relativeTo: this.route, queryParams: { taskId: null }, queryParamsHandling: 'merge' });
  }

  onTaskUpdated(): void {
    const currentTask = this.selectedTask();
    if (currentTask) {
      this.tasksService.getTask(currentTask.id).subscribe({
        next: (res) => {
          this.selectedTask.set(res.data);
          this.tasksService.tasks.update(tasks => tasks.map(t => t.id === res.data.id ? res.data : t));
        },
      });
    }
  }

}
