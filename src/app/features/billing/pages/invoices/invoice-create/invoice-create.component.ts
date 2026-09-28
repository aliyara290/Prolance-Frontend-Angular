import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InvoiceService } from '../../../services/invoice.service';
import { CreateInvoiceRequest, GenerateInvoiceRequest } from '../../../types/invoice.types';
import { BillingType, BILLING_TYPE_LABELS } from '../../../types/billing.enums';
import { CustomSelectComponent, CustomSelectOption } from '../../../../../shared/ui/custom-select/custom-select.component';
import { ProjectsService } from '../../../../project/services/projects.service';
import { ClientsService } from '../../../../crm/clients/services/clients.service';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './invoice-create.component.html',
})
export class InvoiceCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly invoiceService = inject(InvoiceService);
  private readonly projectsService = inject(ProjectsService);
  private readonly clientsService = inject(ClientsService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  activeTab: 'manual' | 'generate' = 'manual';
  readonly isSubmitting = signal(false);

  manualForm!: FormGroup;
  generateForm!: FormGroup;

  readonly billingTypes = Object.values(BillingType);
  readonly billingTypeLabels = BILLING_TYPE_LABELS;

  readonly projectOptions = signal<CustomSelectOption[]>([]);
  readonly clientOptions = signal<CustomSelectOption[]>([]);

  ngOnInit(): void {
    this.buildForms();
    this.loadProjectOptions();
    this.loadClientOptions();
  }

  setTab(tab: 'manual' | 'generate'): void {
    this.activeTab = tab;
  }

  goBack(): void {
    this.router.navigate(['/app/billing/invoices']);
  }

  submitManual(): void {
    if (this.manualForm.invalid || this.isSubmitting()) return;
    this.isSubmitting.set(true);

    const raw = this.manualForm.getRawValue();
    const req: CreateInvoiceRequest = {
      projectId: raw.projectId,
      clientId: raw.clientId,
      billingType: raw.billingType,
      issueDate: raw.issueDate,
      dueDate: raw.dueDate,
      periodStartDate: raw.periodStartDate || undefined,
      periodEndDate: raw.periodEndDate || undefined,
      taxRate: raw.taxRate ?? undefined,
      notes: raw.notes || undefined,
    };

    this.invoiceService.createInvoice(req).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.toast.success('Invoice created');
        this.router.navigate(['/app/billing/invoices', res.data.id]);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toast.error('Failed to create invoice');
      },
    });
  }

  submitGenerate(): void {
    if (this.generateForm.invalid || this.isSubmitting()) return;
    this.isSubmitting.set(true);

    const raw = this.generateForm.getRawValue();
    const req: GenerateInvoiceRequest = {
      projectId: raw.projectId,
      clientId: raw.clientId,
      periodStartDate: raw.periodStartDate,
      periodEndDate: raw.periodEndDate,
      dueDate: raw.dueDate,
      taxRate: raw.taxRate ?? undefined,
      notes: raw.notes || undefined,
    };

    this.invoiceService.generateInvoice(req).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.toast.success('Invoice generated from tracked time');
        this.router.navigate(['/app/billing/invoices', res.data.id]);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toast.error('Failed to generate invoice');
      },
    });
  }

  private buildForms(): void {
    this.manualForm = this.fb.group({
      projectId: ['', Validators.required],
      clientId: ['', Validators.required],
      billingType: [BillingType.HOURLY, Validators.required],
      issueDate: [this.todayDate(), Validators.required],
      dueDate: ['', Validators.required],
      periodStartDate: [''],
      periodEndDate: [''],
      taxRate: [0, [Validators.min(0), Validators.max(100)]],
      notes: [''],
    });

    this.generateForm = this.fb.group({
      projectId: ['', Validators.required],
      clientId: ['', Validators.required],
      periodStartDate: ['', Validators.required],
      periodEndDate: ['', Validators.required],
      dueDate: ['', Validators.required],
      taxRate: [0, [Validators.min(0), Validators.max(100)]],
      notes: [''],
    });

    // Auto-select client based on project
    this.manualForm.get('projectId')?.valueChanges.subscribe(projectId => {
      if (projectId) {
        this.projectsService.getProject(projectId).subscribe(res => {
          if (res.success && res.data.clientId) {
            this.manualForm.patchValue({ clientId: res.data.clientId });
          }
        });
      } else {
        this.manualForm.patchValue({ clientId: '' });
      }
    });

    this.generateForm.get('projectId')?.valueChanges.subscribe(projectId => {
      if (projectId) {
        this.projectsService.getProject(projectId).subscribe(res => {
          if (res.success && res.data.clientId) {
            this.generateForm.patchValue({ clientId: res.data.clientId });
          }
        });
      } else {
        this.generateForm.patchValue({ clientId: '' });
      }
    });
  }

  private loadProjectOptions(): void {
    this.projectsService.loadProjectNames();
    // Use a simple polling approach since projectNames is a signal
    setTimeout(() => {
      const names = this.projectsService.projectNames();
      this.projectOptions.set(
        names.map(p => ({ value: p.id, label: p.name, subLabel: p.prefix }))
      );
    }, 1000);
    // Also set immediately if already loaded
    const existing = this.projectsService.projectNames();
    if (existing.length > 0) {
      this.projectOptions.set(
        existing.map(p => ({ value: p.id, label: p.name, subLabel: p.prefix }))
      );
    }
  }

  private loadClientOptions(): void {
    this.clientsService.getClients().subscribe({
      next: (res) => {
        this.clientOptions.set(
          (res.data ?? []).map(c => ({ value: c.id, label: c.name }))
        );
      },
      error: () => {
        this.clientOptions.set([]);
      },
    });
  }

  private todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
