import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingService } from '../../services/billing.service';
import { Invoice, GenerateInvoiceRequest } from '../../models/billing.models';
import { CustomSelectComponent, CustomSelectOption } from '../../../../shared/ui/custom-select/custom-select.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent implements OnInit {
  private billingService = inject(BillingService);

  invoices = signal<Invoice[]>([]);
  isLoading = signal(false);

  // Generate Invoice Modal State
  isModalOpen = signal(false);
  isGenerating = signal(false);
  
  genProjectId = '';
  genClientId = '';
  genStartDate = '';
  genEndDate = '';
  genTaxPercentage = 20;

  readonly projectOptions: CustomSelectOption[] = [
    { label: 'Website Redesign', value: 'proj-1' },
    { label: 'Mobile App V2', value: 'proj-2' },
    { label: 'Cloud Migration', value: 'proj-3' }
  ];

  readonly clientOptions: CustomSelectOption[] = [
    { label: 'Acme Corp', value: 'client-1' },
    { label: 'Global Tech', value: 'client-2' }
  ];

  ngOnInit(): void {
    // Ideally we fetch from a real backend by default project or tenant.
    // For demo, we just initialize empty.
  }

  openGenerateModal(): void {
    this.genProjectId = '';
    this.genClientId = '';
    this.genStartDate = '';
    this.genEndDate = '';
    this.genTaxPercentage = 20;
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  get isGenerateValid(): boolean {
    return !!(this.genProjectId && this.genClientId && this.genStartDate && this.genEndDate && this.genTaxPercentage >= 0);
  }

  generateInvoice(): void {
    if (!this.isGenerateValid) return;
    this.isGenerating.set(true);

    const req: GenerateInvoiceRequest = {
      projectId: this.genProjectId,
      clientId: this.genClientId,
      startDate: new Date(this.genStartDate).toISOString(),
      endDate: new Date(this.genEndDate).toISOString(),
      taxPercentage: this.genTaxPercentage
    };

    this.billingService.generateInvoice(req).subscribe({
      next: (invoice) => {
        this.invoices.update(list => [invoice, ...list]);
        this.isGenerating.set(false);
        this.closeModal();
      },
      error: (err) => {
        console.error(err);
        this.isGenerating.set(false);
        // Handle error toast
      }
    });
  }

  downloadPdf(attachmentId: string | null): void {
    if (!attachmentId) {
      alert('No PDF attached to this invoice.');
      return;
    }
    // Logic to download from attachment-service
    // e.g., window.open(`${gatewayUrl}/attachments/${attachmentId}`)
    alert(`Downloading attachment: ${attachmentId}`);
  }
}
