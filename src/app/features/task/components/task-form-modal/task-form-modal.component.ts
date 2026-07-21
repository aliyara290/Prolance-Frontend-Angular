import { Component, Input, Output, EventEmitter, inject, signal, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, computed, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TasksService } from '../../services/tasks.service';
import { ProjectsService } from '../../../project/services/projects.service';
import { ProjectMilestonesService } from '../../../project/services/project-milestones.service';
import { UsersStateService } from '../../../tenant/settings/users/service/users-state.service';
import { Search, ChevronDown, Check, LucideAngularModule } from 'lucide-angular';
import { Milestone } from '../../../milestone/types/milestone.model';
import {
  TaskType,
  TaskPriority,
  TaskStatus,
  ALL_TASK_TYPES,
  ALL_TASK_PRIORITIES,
  ALL_TASK_STATUSES,
  TASK_TYPE_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from '../../types/task.model';

import { CustomSelectComponent, CustomSelectOption } from '../../../../shared/ui/custom-select/custom-select.component';

@Component({
  selector: 'app-task-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, CustomSelectComponent],
  templateUrl: './task-form-modal.component.html',
  styleUrls: ['./task-form-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormModalComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly tasksService = inject(TasksService);
  private readonly projectsService = inject(ProjectsService);
  private readonly milestonesService = inject(ProjectMilestonesService);
  private readonly usersStateService = inject(UsersStateService);
  private readonly elementRef = inject(ElementRef);

  @Input() isOpen = false;
  @Input() projectId: string | null = null;
  @Input() editTaskId: string | null = null; // If provided, edit mode

  @Output() closePanel = new EventEmitter<void>();
  @Output() taskSaved = new EventEmitter<void>();

  readonly submitting = signal(false);

  readonly projectNames = this.projectsService.projectNames;
  readonly tenantUsers = this.usersStateService.usersList;
  
  readonly milestones = this.milestonesService.milestones;

  readonly typeOptions = ALL_TASK_TYPES;
  readonly priorityOptions = ALL_TASK_PRIORITIES;
  readonly statusOptions = ALL_TASK_STATUSES;
  readonly typeLabels = TASK_TYPE_LABELS;
  readonly priorityLabels = TASK_PRIORITY_LABELS;
  readonly statusLabels = TASK_STATUS_LABELS;

  readonly typeSelectOptions: CustomSelectOption[] = this.typeOptions.map(t => ({ label: this.typeLabels[t], value: t }));
  readonly prioritySelectOptions: CustomSelectOption[] = this.priorityOptions.map(p => ({ label: this.priorityLabels[p], value: p }));
  readonly statusSelectOptions: CustomSelectOption[] = this.statusOptions.map(s => ({ label: this.statusLabels[s], value: s }));

  get reporterSelectOptions(): CustomSelectOption[] {
    return this.tenantUsers().map(u => ({ label: `${u.firstName} ${u.lastName}`, value: u.keycloakUserId }));
  }

  get projectSelectOptions(): CustomSelectOption[] {
    return this.projectNames().map(p => ({ label: `${p.name} (${p.prefix})`, value: p.id }));
  }

  readonly icons = {
    search: Search,
    chevronDown: ChevronDown,
    check: Check
  };

  // Milestone Dropdown State
  readonly isMilestoneDropdownOpen = signal(false);
  readonly milestoneSearchQuery = signal('');

  readonly filteredMilestones = computed(() => {
    const q = this.milestoneSearchQuery().toLowerCase();
    return this.milestones().filter(m => 
      !q || 
      m.title.toLowerCase().includes(q)
    );
  });

  get selectedMilestone(): Milestone | undefined {
    const id = this.taskForm?.get('milestoneId')?.value;
    return this.milestones().find(m => m.id === id);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    if (this.isMilestoneDropdownOpen() && !targetElement.closest('.milestone-dropdown-container')) {
      this.isMilestoneDropdownOpen.set(false);
    }
  }

  toggleMilestoneDropdown(event: Event): void {
    event.stopPropagation();
    this.isMilestoneDropdownOpen.update(v => !v);
    if (this.isMilestoneDropdownOpen()) {
      this.milestoneSearchQuery.set('');
    }
  }

  selectMilestone(milestone: Milestone | null): void {
    this.taskForm.patchValue({ milestoneId: milestone ? milestone.id : '' });
    this.isMilestoneDropdownOpen.set(false);
    this.milestoneSearchQuery.set('');
  }

  onMilestoneSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.milestoneSearchQuery.set(input.value);
  }

  taskForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.projectsService.loadProjectNames();
    
    // Listen to project changes to reload milestones
    this.taskForm.get('projectId')?.valueChanges.subscribe(newProjectId => {
      if (newProjectId) {
        this.milestonesService.loadMilestones(newProjectId);
      } else {
        this.milestonesService.clear();
      }
      
      // Only reset milestoneId if it's not the initial load of edit mode
      // If we're editing, we don't want to wipe the milestone when projectId is first patched.
      const currentMilestoneId = this.taskForm.get('milestoneId')?.value;
      if (currentMilestoneId && !this.editTaskId) {
        this.taskForm.patchValue({ milestoneId: '' }, { emitEvent: false });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      if (this.taskForm) {
        this.initForm();
      }
      if (this.editTaskId) {
        this.loadTaskDetails(this.editTaskId);
      } else if (this.projectId) {
        this.milestonesService.loadMilestones(this.projectId);
      }
    }
    
    if (changes['projectId'] && this.projectId && this.isOpen && !this.editTaskId) {
       this.milestonesService.loadMilestones(this.projectId);
    }
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      projectId: [this.projectId || '', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      description: ['', [Validators.maxLength(1000)]],
      type: [TaskType.TASK, [Validators.required]],
      priority: [TaskPriority.MEDIUM, [Validators.required]],
      status: [TaskStatus.TODO],
      startDate: ['', [Validators.required]],
      dueDate: [''],
      milestoneId: [''],
      reporterId: [''],
    });
  }

  private loadTaskDetails(id: string): void {
    this.tasksService.getTask(id).subscribe({
      next: (res) => {
        const task = res.data;
        if (task) {
          this.taskForm.patchValue({
            projectId: task.projectId,
            title: task.title,
            description: task.description || '',
            type: task.type,
            priority: task.priority,
            status: task.status,
            startDate: task.startDate ? this.toDatetimeLocal(task.startDate) : '',
            dueDate: task.dueDate ? this.toDatetimeLocal(task.dueDate) : '',
            milestoneId: task.milestoneId || '',
            reporterId: task.reporterId || '',
          });
        }
      },
      error: (err) => console.error('Failed to load task', err),
    });
  }

  private toDatetimeLocal(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.substring(0, 16);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('panel-backdrop')) {
      this.cancel();
    }
  }

  cancel(): void {
    this.closePanel.emit();
    this.taskForm.reset();
  }

  submit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const rawValue = this.taskForm.value;

    if (!this.editTaskId) {
      const createPayload = {
        projectId: rawValue.projectId,
        milestoneId: rawValue.milestoneId || undefined,
        title: rawValue.title,
        description: rawValue.description || undefined,
        type: rawValue.type,
        priority: rawValue.priority,
        status: rawValue.status || undefined,
        startDate: rawValue.startDate + ':00',
        dueDate: rawValue.dueDate ? rawValue.dueDate + ':00' : undefined,
        reporterId: rawValue.reporterId || undefined,
      };

      this.tasksService.createTask(createPayload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.taskForm.reset();
          this.taskSaved.emit();
          this.closePanel.emit();
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Failed to create task', err);
        },
      });
    } else {
      const taskId = this.editTaskId;
      const updatePayload = {
        title: rawValue.title,
        description: rawValue.description || undefined,
        type: rawValue.type,
        priority: rawValue.priority,
        startDate: rawValue.startDate ? rawValue.startDate + ':00' : '',
        dueDate: rawValue.dueDate ? rawValue.dueDate + ':00' : undefined,
        milestoneId: rawValue.milestoneId || undefined,
      };

      this.tasksService.updateTask(taskId, updatePayload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.taskForm.reset();
          this.taskSaved.emit();
          this.closePanel.emit();
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Failed to update task', err);
        },
      });
    }
  }
}
