import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { InvoiceSummaryResponse } from '../../types/invoice.types';
import { InvoiceStatus, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '../../types/billing.enums';
import { InvoiceStatusBadgeComponent } from '../../components/invoice-status-badge/invoice-status-badge.component';
import { formatCurrency, formatDate } from '../../utils/billing.utils';
import { LucideAngularModule, Banknote, Clock, CheckCircle, FileText } from 'lucide-angular';

@Component({
  selector: 'app-billing-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, InvoiceStatusBadgeComponent, LucideAngularModule],
  templateUrl: './billing-overview.component.html',
})
export class BillingOverviewComponent implements OnInit {
  private readonly invoiceService = inject(InvoiceService);
  private readonly router = inject(Router);

  readonly icons = { banknote: Banknote, clock: Clock, check: CheckCircle, file: FileText };

  readonly invoices = signal<InvoiceSummaryResponse[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly statusCounts = computed(() => {
    const list = this.invoices();
    const counts: Record<string, number> = {};
    for (const status of Object.values(InvoiceStatus)) {
      counts[status] = list.filter(i => i.status === status).length;
    }
    return counts;
  });

  readonly totalInvoiced = computed(() =>
    this.invoices().reduce((sum, i) => sum + i.totalAmount, 0)
  );

  readonly outstandingAmount = computed(() =>
    this.invoices()
      .filter(i => i.status === InvoiceStatus.SENT || i.status === InvoiceStatus.OVERDUE || i.status === InvoiceStatus.PARTIALLY_PAID)
      .reduce((sum, i) => sum + i.totalAmount, 0)
  );

  readonly paidAmount = computed(() =>
    this.invoices()
      .filter(i => i.status === InvoiceStatus.PAID)
      .reduce((sum, i) => sum + i.totalAmount, 0)
  );

  readonly recentInvoices = computed(() =>
    [...this.invoices()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );

  readonly statusLabels = INVOICE_STATUS_LABELS;
  readonly statusColors = INVOICE_STATUS_COLORS;
  readonly allStatuses = Object.values(InvoiceStatus);
  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading.set(true);
    this.error.set(null);
    // Load a large page to compute overview stats from available data
    this.invoiceService.getInvoices(0, 500).subscribe({
      next: (res) => {
        this.invoices.set(res.data?.content ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Unable to load billing data.');
        this.isLoading.set(false);
      },
    });
  }

  navigateTo(path: string): void {
    this.router.navigate(['/app/billing', ...path.split('/')]);
  }

  viewInvoice(id: string): void {
    this.router.navigate(['/app/billing/invoices', id]);
  }
}
