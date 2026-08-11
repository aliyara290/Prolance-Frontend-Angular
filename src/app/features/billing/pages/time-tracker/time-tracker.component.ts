import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingService } from '../../services/billing.service';
import { LogTimeRequest, TimeEntry } from '../../models/billing.models';
import { CustomSelectComponent, CustomSelectOption } from '../../../../shared/ui/custom-select/custom-select.component';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-time-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './time-tracker.component.html',
})
export class TimeTrackerComponent {
  private billingService = inject(BillingService);
  private authService = inject(AuthService);

  // Mocking projects for now. Ideally this comes from ProjectService
  readonly projectOptions: CustomSelectOption[] = [
    { label: 'Website Redesign', value: 'proj-1' },
    { label: 'Mobile App V2', value: 'proj-2' },
    { label: 'Cloud Migration', value: 'proj-3' }
  ];

  selectedProjectId = '';
  description = '';
  startTime = '';
  endTime = '';

  isSubmitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  
  recentEntries = signal<TimeEntry[]>([]);

  get isFormValid(): boolean {
    return !!(this.selectedProjectId && this.description && this.startTime && this.endTime);
  }

  logTime(): void {
    if (!this.isFormValid) return;
    
    this.isSubmitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const userId = this.authService.getParsedToken()?.sub || 'user-123';

    const request: LogTimeRequest = {
      projectId: this.selectedProjectId,
      userId: userId,
      description: this.description,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(this.endTime).toISOString()
    };

    this.billingService.logTime(request).subscribe({
      next: (entry) => {
        this.successMessage.set('Time logged successfully!');
        this.recentEntries.update(entries => [entry, ...entries]);
        this.resetForm();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Failed to log time.');
        this.isSubmitting.set(false);
      }
    });
  }

  private resetForm(): void {
    this.selectedProjectId = '';
    this.description = '';
    this.startTime = '';
    this.endTime = '';
    setTimeout(() => this.successMessage.set(''), 3000);
  }
}
