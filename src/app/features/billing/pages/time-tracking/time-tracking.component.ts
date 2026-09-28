import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeEntryService } from '../../services/time-entry.service';
import { TimeEntryResponse, LogTimeRequest } from '../../types/time-entry.types';
import { TimeEntryDialogComponent } from '../../components/time-entry-dialog/time-entry-dialog.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { ConfirmModalService } from '../../../../shared/ui/confirm-modal/confirm-modal.service';
import { ProjectsService } from '../../../project/services/projects.service';
import { CustomSelectOption } from '../../../../shared/ui/custom-select/custom-select.component';
import { formatDuration, formatDateTime } from '../../utils/billing.utils';

@Component({
  selector: 'app-time-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeEntryDialogComponent],
  templateUrl: './time-tracking.component.html',
})
export class TimeTrackingComponent implements OnInit {
  private readonly timeEntryService = inject(TimeEntryService);
  private readonly projectsService = inject(ProjectsService);
  private readonly toast = inject(ToastService);
  private readonly confirmService = inject(ConfirmModalService);

  readonly entries = signal<TimeEntryResponse[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly isDialogOpen = signal(false);
  readonly editingEntry = signal<TimeEntryResponse | null>(null);
  readonly isSubmitting = signal(false);

  readonly projectOptions = signal<CustomSelectOption[]>([]);

  // Filters
  selectedProjectId = '';
  dateFrom = '';
  dateTo = '';

  readonly totalDuration = computed(() =>
    this.entries().reduce((sum, e) => sum + e.durationMinutes, 0)
  );

  readonly billableCount = computed(() =>
    this.entries().filter(e => e.billable).length
  );

  readonly formatDuration = formatDuration;
  readonly formatDateTime = formatDateTime;

  ngOnInit(): void {
    this.projectsService.loadProjectNames();
    // Set default date range to current month
    const now = new Date();
    this.dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    this.dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Load project options
    setTimeout(() => {
      const names = this.projectsService.projectNames();
      this.projectOptions.set(
        names.map(p => ({ value: p.id, label: p.name, subLabel: p.prefix }))
      );
    }, 500);
    const existing = this.projectsService.projectNames();
    if (existing.length > 0) {
      this.projectOptions.set(
        existing.map(p => ({ value: p.id, label: p.name, subLabel: p.prefix }))
      );
    }
  }

  loadEntries(): void {
    if (!this.selectedProjectId) return;
    if (!this.dateFrom || !this.dateTo) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.timeEntryService.getTimeEntriesByProject(this.selectedProjectId, this.dateFrom, this.dateTo).subscribe({
      next: (data) => {
        this.entries.set(data ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Unable to load time entries.');
        this.isLoading.set(false);
      },
    });
  }

  openLogTime(): void {
    this.editingEntry.set(null);
    this.isDialogOpen.set(true);
  }

  openEditEntry(entry: TimeEntryResponse): void {
    this.editingEntry.set(entry);
    this.isDialogOpen.set(true);
  }

  closeDialog(): void {
    this.isDialogOpen.set(false);
    this.editingEntry.set(null);
  }

  onSubmitted(req: LogTimeRequest): void {
    this.isSubmitting.set(true);
    const editing = this.editingEntry();

    if (editing) {
      this.timeEntryService.updateTimeEntry(editing.id, req).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeDialog();
          this.toast.success('Time entry updated');
          this.loadEntries();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toast.error('Failed to update time entry');
        },
      });
    } else {
      this.timeEntryService.logTime(req).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeDialog();
          this.toast.success('Time logged');
          // Auto-select project if not yet selected
          if (!this.selectedProjectId) {
            this.selectedProjectId = req.projectId;
          }
          this.loadEntries();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toast.error('Failed to log time');
        },
      });
    }
  }

  async deleteEntry(entry: TimeEntryResponse): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Time Entry',
      message: `Delete "${entry.description}"? This cannot be undone.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;

    this.timeEntryService.deleteTimeEntry(entry.id).subscribe({
      next: () => {
        this.toast.success('Time entry deleted');
        this.entries.update(list => list.filter(e => e.id !== entry.id));
      },
      error: () => this.toast.error('Failed to delete time entry'),
    });
  }

  getProjectName(projectId: string): string {
    const opt = this.projectOptions().find(p => p.value === projectId);
    return opt?.label ?? projectId;
  }
}
