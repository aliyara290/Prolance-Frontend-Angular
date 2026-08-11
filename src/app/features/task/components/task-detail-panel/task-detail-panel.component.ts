import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmModalService } from '../../../../shared/ui/confirm-modal/confirm-modal.service';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { TasksService, UserDisplay } from '../../services/tasks.service';
import { TaskAssignmentsService } from '../../services/task-assignments.service';
import { TaskCommentsService } from '../../services/task-comments.service';
import { TaskDependenciesService } from '../../services/task-dependencies.service';
import { UsersStateService } from '../../../tenant/settings/users/service/users-state.service';
import { WorkspaceUser } from '../../../tenant/settings/users/models/user.models';
import { ProjectMilestonesService } from '../../../project/services/project-milestones.service';
import {
  TaskResponse,
  TaskAssignmentResponse,
  TaskCommentResponse,
  TaskDependencyResponse,
  TaskStatus,
  TaskPriority,
  TaskType,
  RoleInTask,
  DependencyType,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_STATUS_BG_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_TYPE_LABELS,
  TASK_TYPE_COLORS,
  ROLE_IN_TASK_LABELS,
  DEPENDENCY_TYPE_LABELS,
  ALL_TASK_STATUSES,
  ALL_ROLES_IN_TASK,
  ALL_DEPENDENCY_TYPES,
  ChangeTaskStatusRequest,
  CreateTaskAssignmentRequest,
  CreateTaskCommentRequest,
  CreateTaskDependencyRequest,
} from '../../types/task.model';

import { CustomSelectComponent, CustomSelectOption } from '../../../../shared/ui/custom-select/custom-select.component';
import { AttachmentsComponent } from '../../../../shared/ui/attachments/attachments.component';

@Component({
  selector: 'app-task-detail-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DropdownMenuComponent, CustomSelectComponent, AttachmentsComponent],
  templateUrl: './task-detail-panel.component.html',
  styleUrls: ['./task-detail-panel.component.css'],
})
export class TaskDetailPanelComponent implements OnChanges {
  private readonly tasksService = inject(TasksService);
  private readonly assignmentsService = inject(TaskAssignmentsService);
  private readonly commentsService = inject(TaskCommentsService);
  private readonly dependenciesService = inject(TaskDependenciesService);
  private readonly usersStateService = inject(UsersStateService);
  private readonly milestonesService = inject(ProjectMilestonesService, { optional: true });
  private readonly confirmService = inject(ConfirmModalService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  @Input() task: TaskResponse | null = null;
  @Input() isOpen = false;
  @Input() allTasks: TaskResponse[] = [];

  @Output() closePanel = new EventEmitter<void>();
  @Output() editTask = new EventEmitter<TaskResponse>();
  @Output() taskUpdated = new EventEmitter<void>();

  // ── Track current task to avoid resetting section on data refresh ──
  private currentTaskId: string | null = null;

  // ── Panel sections ──
  readonly activeSection = signal<'details' | 'assignments' | 'comments' | 'dependencies' | 'history' | 'attachments'>('details');

  // ── Assignments ──
  readonly showAssignForm = signal(false);
  readonly assignUserId = signal('');
  readonly assignRole = signal<RoleInTask>(RoleInTask.ASSIGNEE);
  readonly assignAllocation = signal(100);
  readonly assigningUser = signal(false);

  // ── Comments ──
  readonly newCommentContent = signal('');
  readonly addingComment = signal(false);
  readonly editingCommentId = signal<string | null>(null);
  readonly editCommentContent = signal('');

  // ── Dependencies ──
  readonly showDepForm = signal(false);
  readonly depTaskId = signal('');
  readonly depType = signal<DependencyType>(DependencyType.BLOCKS);
  readonly addingDependency = signal(false);

  // ── Status change ──
  readonly showStatusChange = signal(false);
  readonly newStatus = signal<TaskStatus>(TaskStatus.TODO);
  readonly statusComment = signal('');

  // ── Constants ──
  readonly allStatuses = ALL_TASK_STATUSES;
  readonly allRolesInTask = ALL_ROLES_IN_TASK;
  readonly allDependencyTypes = ALL_DEPENDENCY_TYPES;
  readonly statusLabels = TASK_STATUS_LABELS;
  readonly priorityLabels = TASK_PRIORITY_LABELS;
  readonly typeLabels = TASK_TYPE_LABELS;
  readonly roleLabels = ROLE_IN_TASK_LABELS;
  readonly depTypeLabels = DEPENDENCY_TYPE_LABELS;
  readonly milestoneName = signal<string | null>(null);

  readonly tenantUsers = this.usersStateService.usersList;

  readonly assignRoleOptions: CustomSelectOption[] = this.allRolesInTask.map(r => ({ label: this.roleLabels[r], value: r }));
  readonly depTypeSelectOptions: CustomSelectOption[] = this.allDependencyTypes.map(d => ({ label: this.depTypeLabels[d], value: d }));
  readonly statusSelectOptions: CustomSelectOption[] = this.allStatuses.map(s => ({ label: this.statusLabels[s], value: s }));

  get assignUserOptions(): CustomSelectOption[] {
    return this.getAvailableUsers().map(u => ({ label: `${u.firstName} ${u.lastName}`, value: u.keycloakUserId }));
  }

  get depTaskOptions(): CustomSelectOption[] {
    return this.getAvailableTasksForDep().map(t => ({ label: t.title, value: t.id }));
  }

  readonly panelMenuItems: DropdownMenuItem[] = [
    { label: 'Change Status', value: 'status', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>' },
    { label: 'Edit Task', value: 'edit', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>' },
    { label: 'Delete Task', value: 'delete', danger: true, dividerBefore: true, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>' }
  ];

  readonly commentMenuItems: DropdownMenuItem[] = [
    { label: 'Edit', value: 'edit', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>' },
    { label: 'Delete', value: 'delete', danger: true, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>' }
  ];

  onMenuItemClick(item: DropdownMenuItem): void {
    if (!this.task) return;
    switch (item.value) {
      case 'status':
        this.openStatusChange();
        break;
      case 'edit':
        this.editTask.emit(this.task);
        break;
      case 'delete':
        this.deleteTask();
        break;
    }
  }

  onCommentMenuItemClick(item: DropdownMenuItem, comment: TaskCommentResponse): void {
    if (item.value === 'edit') {
      this.startEditComment(comment);
    } else if (item.value === 'delete') {
      this.onRemoveComment(comment);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (!this.isOpen) {
        this.resetState();
        this.currentTaskId = null;
        this.milestoneName.set(null);
        
        // Remove fragment when closing modal
        this.router.navigate([], {
          relativeTo: this.route,
          fragment: undefined,
          queryParamsHandling: 'preserve',
          replaceUrl: true
        });
      } else if (this.task) {
        this.initializeTaskData(this.task);
      }
    }

    if (changes['task'] && this.isOpen && this.task) {
      if (this.currentTaskId !== this.task.id) {
        this.initializeTaskData(this.task);
      }
    }
  }

  private initializeTaskData(task: TaskResponse): void {
    this.currentTaskId = task.id;
    
    // Determine active tab from URL hash
    const hash = window.location.hash.replace('#', '');
    if (hash === 'comments') {
      this.activeSection.set('comments');
    } else if (hash === 'assignees' || hash === 'assignments') {
      this.activeSection.set('assignments');
    } else if (hash === 'dependencies') {
      this.activeSection.set('dependencies');
    } else if (hash === 'history') {
      this.activeSection.set('history');
    } else {
      this.activeSection.set('details');
    }

    this.resetForms();
    this.milestoneName.set(null);

    if (task.milestoneId && this.milestonesService) {
      this.resolveMilestoneName(task.projectId, task.milestoneId);
    }
  }

  private resolveMilestoneName(projectId: string, milestoneId: string): void {
    this.milestonesService?.getMilestone(projectId, milestoneId).subscribe({
      next: (m) => {
        if (m.data) this.milestoneName.set(m.data.title);
      },
      error: () => this.milestoneName.set(null),
    });
  }

  onClose(): void {
    this.closePanel.emit();
    this.resetState();
  }

  async deleteTask(): Promise<void> {
    if (!this.task) return;
    
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Task',
      message: `Are you sure you want to delete task "${this.task.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });
    
    if (!confirmed) return;

    this.tasksService.deleteTask(this.task.id).subscribe({
      next: () => {
        this.taskUpdated.emit();
        this.onClose();
      },
      error: (err) => console.error('Failed to delete task', err),
    });
  }

  private resetState(): void {
    this.activeSection.set('details');
    this.resetForms();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('panel-backdrop')) {
      this.onClose();
    }
  }

  setSection(section: 'details' | 'assignments' | 'comments' | 'dependencies' | 'history' | 'attachments'): void {
    this.activeSection.set(section);
    
    this.router.navigate([], {
      relativeTo: this.route,
      fragment: section === 'details' ? undefined : section,
      queryParamsHandling: 'preserve',
      replaceUrl: true
    });
  }

  // ── User Display Helpers ──

  getUserDisplay(userId: string | null | undefined): UserDisplay {
    return this.tasksService.getUserDisplay(userId);
  }

  getAvailableUsers(): WorkspaceUser[] {
    if (!this.task) return this.tenantUsers().filter(u => u.status === 'ACTIVE');
    const assignedIds = new Set((this.task.assignments ?? []).map(a => a.userId));
    return this.tenantUsers().filter(u => u.status === 'ACTIVE' && !assignedIds.has(u.keycloakUserId));
  }

  getAvailableTasksForDep(): TaskResponse[] {
    if (!this.task) return this.allTasks;
    const existingDepIds = new Set((this.task.dependencies ?? []).map(d => d.dependOnTaskId));
    return this.allTasks.filter(t => t.id !== this.task!.id && !existingDepIds.has(t.id));
  }

  // ── Status Helpers ──

  getStatusColor(status: TaskStatus): string {
    return TASK_STATUS_COLORS[status] ?? 'var(--color-text-muted)';
  }

  getStatusBg(status: TaskStatus): string {
    return TASK_STATUS_BG_COLORS[status] ?? 'var(--color-bg-muted)';
  }

  getPriorityColor(priority: TaskPriority): string {
    return TASK_PRIORITY_COLORS[priority] ?? 'var(--color-text-muted)';
  }

  getTypeColor(type: TaskType): string {
    return TASK_TYPE_COLORS[type] ?? 'var(--color-text-muted)';
  }

  // ── Status Change ──

  openStatusChange(): void {
    if (this.task) {
      this.newStatus.set(this.task.status);
      this.statusComment.set('');
      this.showStatusChange.set(true);
    }
  }

  submitStatusChange(): void {
    if (!this.task) return;
    const payload: ChangeTaskStatusRequest = {
      newStatus: this.newStatus(),
      comment: this.statusComment() || undefined,
    };
    this.tasksService.changeTaskStatus(this.task.id, payload).subscribe({
      next: () => {
        this.showStatusChange.set(false);
        this.taskUpdated.emit();
      },
      error: (err) => console.error('Failed to change status', err),
    });
  }

  // ── Assignments ──

  onAssignUser(): void {
    if (!this.task || !this.assignUserId()) return;
    this.assigningUser.set(true);

    const payload: CreateTaskAssignmentRequest = {
      userId: this.assignUserId(),
      role: this.assignRole(),
      allocationPercentage: this.assignAllocation(),
    };

    this.assignmentsService.assignUser(this.task.id, payload).subscribe({
      next: () => {
        this.assigningUser.set(false);
        this.showAssignForm.set(false);
        this.resetAssignForm();
        this.taskUpdated.emit();
      },
      error: (err) => {
        console.error('Failed to assign user', err);
        this.assigningUser.set(false);
      },
    });
  }

  async onUnassignUser(assignment: TaskAssignmentResponse): Promise<void> {
    if (!this.task) return;
    const display = this.getUserDisplay(assignment.userId);
    
    const confirmed = await this.confirmService.confirm({
      title: 'Remove User',
      message: `Remove ${display.name} from this task?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      danger: true
    });
    
    if (!confirmed) return;

    this.assignmentsService.unassignUser(this.task.id, assignment.userId).subscribe({
      next: () => this.taskUpdated.emit(),
      error: (err) => console.error('Failed to unassign user', err),
    });
  }

  // ── Comments ──

  onAddComment(): void {
    if (!this.task || !this.newCommentContent().trim()) return;
    this.addingComment.set(true);

    const payload: CreateTaskCommentRequest = {
      content: this.newCommentContent().trim(),
    };

    this.commentsService.addComment(this.task.id, payload).subscribe({
      next: () => {
        this.addingComment.set(false);
        this.newCommentContent.set('');
        this.taskUpdated.emit();
      },
      error: (err) => {
        console.error('Failed to add comment', err);
        this.addingComment.set(false);
      },
    });
  }

  startEditComment(comment: TaskCommentResponse): void {
    this.editingCommentId.set(comment.id);
    this.editCommentContent.set(comment.content);
  }

  cancelEditComment(): void {
    this.editingCommentId.set(null);
    this.editCommentContent.set('');
  }

  saveEditComment(comment: TaskCommentResponse): void {
    if (!this.task || !this.editCommentContent().trim()) return;

    this.commentsService.editComment(this.task.id, comment.id, {
      content: this.editCommentContent().trim(),
    }).subscribe({
      next: () => {
        this.editingCommentId.set(null);
        this.editCommentContent.set('');
        this.taskUpdated.emit();
      },
      error: (err) => console.error('Failed to edit comment', err),
    });
  }

  async onRemoveComment(comment: TaskCommentResponse): Promise<void> {
    if (!this.task) return;
    
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Comment',
      message: 'Delete this comment?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });
    
    if (!confirmed) return;

    this.commentsService.removeComment(this.task.id, comment.id).subscribe({
      next: () => this.taskUpdated.emit(),
      error: (err) => console.error('Failed to remove comment', err),
    });
  }

  // ── Dependencies ──

  onAddDependency(): void {
    if (!this.task || !this.depTaskId()) return;
    this.addingDependency.set(true);

    const payload: CreateTaskDependencyRequest = {
      dependOnTaskId: this.depTaskId(),
      type: this.depType(),
    };

    this.dependenciesService.addDependency(this.task.id, payload).subscribe({
      next: () => {
        this.addingDependency.set(false);
        this.showDepForm.set(false);
        this.resetDepForm();
        this.taskUpdated.emit();
      },
      error: (err) => {
        console.error('Failed to add dependency', err);
        this.addingDependency.set(false);
      },
    });
  }

  async onRemoveDependency(dep: TaskDependencyResponse): Promise<void> {
    if (!this.task) return;
    
    const confirmed = await this.confirmService.confirm({
      title: 'Remove Dependency',
      message: 'Remove this dependency?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      danger: true
    });
    
    if (!confirmed) return;

    this.dependenciesService.removeDependency(this.task.id, dep.id).subscribe({
      next: () => this.taskUpdated.emit(),
      error: (err) => console.error('Failed to remove dependency', err),
    });
  }

  getDepTaskTitle(taskId: string): string {
    const found = this.allTasks.find(t => t.id === taskId);
    return found ? found.title : 'Unknown Task';
  }

  // ── Form Resets ──

  private resetForms(): void {
    this.resetAssignForm();
    this.resetDepForm();
    this.showAssignForm.set(false);
    this.showDepForm.set(false);
    this.showStatusChange.set(false);
    this.newCommentContent.set('');
    this.editingCommentId.set(null);
  }

  private resetAssignForm(): void {
    this.assignUserId.set('');
    this.assignRole.set(RoleInTask.ASSIGNEE);
    this.assignAllocation.set(100);
  }

  private resetDepForm(): void {
    this.depTaskId.set('');
    this.depType.set(DependencyType.BLOCKS);
  }
}
