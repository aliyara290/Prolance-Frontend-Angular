import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeEntryDialogComponent } from '../../../../features/billing/components/time-entry-dialog/time-entry-dialog.component';
import { TimeEntryService } from '../../../../features/billing/services/time-entry.service';
import { ProjectsService } from '../../../../features/project/services/projects.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { CustomSelectOption } from '../../../../shared/ui/custom-select/custom-select.component';
import { LogTimeRequest } from '../../../../features/billing/types/time-entry.types';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TimeEntryDialogComponent],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex justify-end w-full border-t border-[var(--color-border-strong)] bg-[var(--color-bg)] text-[var(--color-text-muted)] text-xs h-[30px] flex items-center pr-[var(--spacing-md)] justify-between shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.10)]'
  }
})
export class FooterComponent implements OnInit {
  private readonly timeEntryService = inject(TimeEntryService);
  private readonly projectsService = inject(ProjectsService);
  private readonly toast = inject(ToastService);

  currentYear = new Date().getFullYear();
  appVersion = 'v1.0.0-beta';

  readonly isDialogOpen = signal(false);
  readonly isSubmitting = signal(false);
  readonly projectOptions = signal<CustomSelectOption[]>([]);

  ngOnInit(): void {
    this.projectsService.loadProjectNames();

    // Initial load check
    const existing = this.projectsService.projectNames();
    if (existing.length > 0) {
      this.projectOptions.set(
        existing.map(p => ({ value: p.id, label: p.name, subLabel: p.prefix }))
      );
    }

    setTimeout(() => {
      const names = this.projectsService.projectNames();
      this.projectOptions.set(
        names.map(p => ({ value: p.id, label: p.name, subLabel: p.prefix }))
      );
    }, 500);
  }

  openLogTime(): void {
    this.isDialogOpen.set(true);
  }

  closeDialog(): void {
    this.isDialogOpen.set(false);
  }

  onSubmitted(req: LogTimeRequest): void {
    this.isSubmitting.set(true);
    this.timeEntryService.logTime(req).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeDialog();
        this.toast.success('Time logged successfully!');
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toast.error('Failed to log time');
      },
    });
  }
}
