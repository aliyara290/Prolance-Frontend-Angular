import {
  Component,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ViewChild
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../services/invoice.service';
import { InvoiceSummaryResponse } from '../../../types/invoice.types';
import { InvoiceStatus, BillingType, INVOICE_STATUS_LABELS, BILLING_TYPE_LABELS } from '../../../types/billing.enums';
import { formatCurrency, formatDate } from '../../../utils/billing.utils';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';
import { ConfirmModalService } from '../../../../../shared/ui/confirm-modal/confirm-modal.service';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { ModuleHeaderComponent } from '../../../../../shared/ui/module-header/module-header.component';
import { ModuleHeaderAction } from '../../../../../shared/ui/module-header/module-header.types';

// PrimeNG
import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from 'primeng/api';

import { EntityListSkeletonComponent } from '../../../../../shared/ui/skeletons/entity-list-skeleton/entity-list-skeleton.component';
import { ErrorMessageComponent } from '../../../../../shared/ui/error-message/error-message.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TitleCasePipe,
    TableModule,
    TagModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    SharedModule,
    DropdownMenuComponent,
    ModuleHeaderComponent,
    EntityListSkeletonComponent,
    ErrorMessageComponent
  ],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {
  private readonly invoiceService = inject(InvoiceService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirmService = inject(ConfirmModalService);

  @ViewChild('dt') dt: Table | undefined;

  readonly invoices = signal<InvoiceSummaryResponse[]>([]);
  readonly totalRecords = signal(0);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  filterStatus: InvoiceStatus | null = null;
  filterType: BillingType | null = null;
  searchTerm: string = '';

  readonly statusOptions = Object.values(InvoiceStatus).map(s => ({
    label: INVOICE_STATUS_LABELS[s],
    value: s
  }));

  readonly typeOptions = Object.values(BillingType).map(t => ({
    label: BILLING_TYPE_LABELS[t],
    value: t
  }));

  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;

  ngOnInit(): void {
    // Initial load, fetch up to 500 invoices for client-side filtering
    this.loadInvoices(0, 500, 'createdAt,desc');
  }

  loadInvoices(page: number, size: number, sort?: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.invoiceService.getInvoices(page, size, sort).subscribe({
      next: (res) => {
        this.invoices.set(res.data.content ?? []);
        this.totalRecords.set(res.data.totalElements ?? 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Unable to load invoices.');
        this.isLoading.set(false);
      },
    });
  }

  onRefresh(): void {
    this.loadInvoices(0, 500, 'createdAt,desc');
  }

  clearFilters(): void {
    this.filterStatus = null;
    this.filterType = null;
    this.searchTerm = '';
    if (this.dt) {
      this.dt.clear();
      this.dt.filterGlobal('', 'contains');
    }
  }

  createInvoice(): void {
    this.router.navigate(['/app/billing/invoices/new']);
  }

  getStatusSeverity(status: InvoiceStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    switch (status) {
      case InvoiceStatus.PAID: return 'success';
      case InvoiceStatus.PARTIALLY_PAID: return 'info';
      case InvoiceStatus.DRAFT: return 'secondary';
      case InvoiceStatus.SENT: return 'info';
      case InvoiceStatus.OVERDUE: return 'danger';
      case InvoiceStatus.CANCELLED: return 'secondary';
      default: return 'secondary';
    }
  }

  getTypeSeverity(type: BillingType): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    switch (type) {
      case BillingType.HOURLY: return 'info';
      case BillingType.FIXED_PRICE: return 'success';
      case BillingType.MILESTONE: return 'warn';
      default: return 'secondary';
    }
  }

  readonly moreActions: DropdownMenuItem[] = [
    { label: 'View Details', value: 'view' },
    { label: 'Delete Invoice', value: 'delete', danger: true, dividerBefore: true },
  ];

  async onMoreAction(item: DropdownMenuItem, invoice: InvoiceSummaryResponse): Promise<void> {
    if (item.value === 'view') {
      this.router.navigate(['/app/billing/invoices', invoice.id]);
    } else if (item.value === 'delete') {
      if (invoice.status !== InvoiceStatus.DRAFT) {
        this.toast.error('Only draft invoices can be deleted');
        return;
      }
      
      const confirmed = await this.confirmService.confirm({
        title: 'Delete Invoice',
        message: `Are you sure you want to delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`,
        confirmText: 'Delete',
        danger: true,
      });
      
      if (confirmed) {
        this.invoiceService.deleteInvoice(invoice.id).subscribe({
          next: () => {
            this.toast.success('Invoice deleted');
            this.onRefresh();
          },
          error: () => {
            this.toast.error('Failed to delete invoice');
          },
        });
      }
    }
  }
}
