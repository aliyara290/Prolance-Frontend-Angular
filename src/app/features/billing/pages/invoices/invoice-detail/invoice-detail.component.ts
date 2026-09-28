import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InvoiceService } from '../../../services/invoice.service';
import { InvoiceResponse, InvoiceLineItemResponse, AddLineItemRequest, UpdateLineItemRequest } from '../../../types/invoice.types';
import { InvoiceStatus, BILLING_TYPE_LABELS, LINE_ITEM_UNIT_LABELS } from '../../../types/billing.enums';
import { InvoiceStatusBadgeComponent } from '../../../components/invoice-status-badge/invoice-status-badge.component';
import { BillingTypeBadgeComponent } from '../../../components/billing-type-badge/billing-type-badge.component';
import { LineItemDialogComponent } from '../../../components/line-item-dialog/line-item-dialog.component';
import { InvoiceActionDialogComponent, InvoiceActionType } from '../../../components/invoice-action-dialog/invoice-action-dialog.component';
import { ToastService } from '../../../../../shared/ui/toast/toast.service';
import { ConfirmModalService } from '../../../../../shared/ui/confirm-modal/confirm-modal.service';
import { AttachmentService } from '../../../../../core/services/attachment.service';
import { getAvailableActions, InvoiceAction, formatCurrency, formatDate, formatDateRange } from '../../../utils/billing.utils';
import { AttachmentsComponent } from '../../../../../shared/ui/attachments/attachments.component';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { ClientsService } from '../../../../crm/clients/services/clients.service';
import { ProjectsService } from '../../../../project/services/projects.service';
import { LucideAngularModule, ArrowLeft, FileText } from 'lucide-angular';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    InvoiceStatusBadgeComponent,
    BillingTypeBadgeComponent,
    LineItemDialogComponent,
    InvoiceActionDialogComponent,
    AttachmentsComponent,
    LucideAngularModule,
    DropdownMenuComponent
  ],
  templateUrl: './invoice-detail.component.html',
})
export class InvoiceDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invoiceService = inject(InvoiceService);
  private readonly toast = inject(ToastService);
  private readonly confirmService = inject(ConfirmModalService);
  private readonly attachmentService = inject(AttachmentService);
  private readonly clientsService = inject(ClientsService);
  private readonly projectsService = inject(ProjectsService);

  readonly ArrowLeft = ArrowLeft;
  readonly FileText = FileText;

  readonly invoice = signal<InvoiceResponse | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<'overview' | 'line-items' | 'attachments'>('overview');

  readonly clientName = signal<string | null>(null);
  readonly projectName = signal<string | null>(null);

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(params => {
      const tab = params['tab'];
      if (tab === 'overview' || tab === 'line-items' || tab === 'attachments') {
        this.activeTab.set(tab);
      }
    });
  }

  setTab(tab: 'overview' | 'line-items' | 'attachments'): void {
    const queryParams: any = { tab };
    if (tab !== 'attachments') {
      queryParams['attachment-view'] = null;
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  get moreActions(): DropdownMenuItem[] {
    const actions: DropdownMenuItem[] = [];
    
    if (this.hasAction('pdf')) {
      actions.push({ label: 'Download PDF', value: 'pdf' });
    }
    if (this.hasAction('send')) {
      actions.push({ label: 'Send Invoice', value: 'send' });
    }
    if (this.hasAction('pay')) {
      actions.push({ label: 'Mark Paid', value: 'pay' });
    }
    if (this.hasAction('partial-pay')) {
      actions.push({ label: 'Partial Payment', value: 'partial-pay' });
    }
    if (this.hasAction('cancel')) {
      actions.push({ label: 'Cancel Invoice', value: 'cancel' });
    }
    if (this.hasAction('edit')) {
      actions.push({ label: 'Edit Invoice', value: 'edit' });
    }
    if (this.hasAction('delete')) {
      actions.push({ label: 'Delete Invoice', value: 'delete', danger: true });
    }
    return actions;
  }

  onMoreAction(item: DropdownMenuItem): void {
    switch (item.value) {
      case 'pdf':
        this.generatePdf();
        break;
      case 'send':
      case 'pay':
      case 'partial-pay':
      case 'cancel':
        this.openAction(item.value as InvoiceActionType);
        break;
      case 'edit':
        this.editInvoice();
        break;
      case 'delete':
        this.deleteInvoice();
        break;
    }
  }

  get lineItemActions(): DropdownMenuItem[] {
    return [
      { label: 'Edit', value: 'edit' },
      { label: 'Delete', value: 'delete', danger: true }
    ];
  }

  onLineItemAction(action: DropdownMenuItem, item: InvoiceLineItemResponse): void {
    if (action.value === 'edit') {
      this.openEditLineItem(item);
    } else if (action.value === 'delete') {
      this.deleteLineItem(item);
    }
  }


  // Line item dialog state
  readonly isLineItemDialogOpen = signal(false);
  readonly editingLineItem = signal<InvoiceLineItemResponse | null>(null);
  readonly isLineItemSubmitting = signal(false);

  // Action dialog state
  readonly isActionDialogOpen = signal(false);
  readonly currentAction = signal<InvoiceActionType>('send');
  readonly isActionSubmitting = signal(false);

  // PDF state
  readonly isGeneratingPdf = signal(false);

  readonly billingTypeLabels = BILLING_TYPE_LABELS;
  readonly unitLabels = LINE_ITEM_UNIT_LABELS;
  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;
  readonly formatDateRange = formatDateRange;

  private invoiceId = '';

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.invoiceId) {
      this.loadInvoice();
    } else {
      this.error.set('Invalid invoice ID.');
      this.isLoading.set(false);
    }
  }

  loadInvoice(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.invoiceService.getInvoice(this.invoiceId).subscribe({
      next: (res) => {
        const inv = res.data;
        this.invoice.set(inv);
        this.isLoading.set(false);
        
        // Fetch client name
        if (inv.clientId) {
          this.clientsService.getClient(inv.clientId).subscribe({
            next: (cRes) => this.clientName.set(cRes.data?.name || inv.clientId),
            error: () => this.clientName.set(inv.clientId)
          });
        }
        
        // Fetch project name
        if (inv.projectId) {
          this.projectsService.getProject(inv.projectId).subscribe({
            next: (pRes) => this.projectName.set(pRes.data?.name || inv.projectId),
            error: () => this.projectName.set(inv.projectId)
          });
        }
      },
      error: () => {
        this.error.set('Unable to load invoice.');
        this.isLoading.set(false);
      },
    });
  }

  get availableActions(): InvoiceAction[] {
    const inv = this.invoice();
    return inv ? getAvailableActions(inv.status) : [];
  }

  hasAction(action: InvoiceAction): boolean {
    return this.availableActions.includes(action);
  }

  goBack(): void {
    this.router.navigate(['/app/billing/invoices']);
  }


  openAddLineItem(): void {
    this.editingLineItem.set(null);
    this.isLineItemDialogOpen.set(true);
  }

  openEditLineItem(item: InvoiceLineItemResponse): void {
    this.editingLineItem.set(item);
    this.isLineItemDialogOpen.set(true);
  }

  closeLineItemDialog(): void {
    this.isLineItemDialogOpen.set(false);
    this.editingLineItem.set(null);
  }

  onLineItemSubmitted(data: { description: string; quantity: number; unit: string; unitPrice: number; displayOrder?: number; userId?: string }): void {
    this.isLineItemSubmitting.set(true);
    const editing = this.editingLineItem();

    if (editing) {
      const req: UpdateLineItemRequest = {
        description: data.description,
        quantity: data.quantity,
        unit: data.unit as any,
        unitPrice: data.unitPrice,
        displayOrder: data.displayOrder,
      };
      this.invoiceService.updateLineItem(this.invoiceId, editing.id, req).subscribe({
        next: (res) => {
          this.invoice.set(res.data);
          this.isLineItemSubmitting.set(false);
          this.closeLineItemDialog();
          this.toast.success('Line item updated');
        },
        error: () => {
          this.isLineItemSubmitting.set(false);
          this.toast.error('Failed to update line item');
        },
      });
    } else {
      const req: AddLineItemRequest = {
        description: data.description,
        quantity: data.quantity,
        unit: data.unit as any,
        unitPrice: data.unitPrice,
        displayOrder: data.displayOrder,
        userId: data.userId || undefined,
      };
      this.invoiceService.addLineItem(this.invoiceId, req).subscribe({
        next: (res) => {
          this.invoice.set(res.data);
          this.isLineItemSubmitting.set(false);
          this.closeLineItemDialog();
          this.toast.success('Line item added');
        },
        error: () => {
          this.isLineItemSubmitting.set(false);
          this.toast.error('Failed to add line item');
        },
      });
    }
  }

  async deleteLineItem(item: InvoiceLineItemResponse): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Line Item',
      message: `Remove "${item.description}" from this invoice?`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;

    this.invoiceService.deleteLineItem(this.invoiceId, item.id).subscribe({
      next: (res) => {
        this.invoice.set(res.data);
        this.toast.success('Line item removed');
      },
      error: () => this.toast.error('Failed to delete line item'),
    });
  }


  openAction(action: InvoiceActionType): void {
    this.currentAction.set(action);
    this.isActionDialogOpen.set(true);
  }

  closeActionDialog(): void {
    this.isActionDialogOpen.set(false);
  }

  onActionConfirmed(inputValue: string): void {
    this.isActionSubmitting.set(true);
    const action = this.currentAction();

    let obs$;
    switch (action) {
      case 'send':
        obs$ = this.invoiceService.sendInvoice(this.invoiceId);
        break;
      case 'pay':
        obs$ = this.invoiceService.payInvoice(this.invoiceId, inputValue || undefined);
        break;
      case 'partial-pay':
        obs$ = this.invoiceService.partialPayInvoice(this.invoiceId, inputValue || undefined);
        break;
      case 'cancel':
        obs$ = this.invoiceService.cancelInvoice(this.invoiceId, inputValue || undefined);
        break;
    }

    obs$.subscribe({
      next: (res) => {
        this.invoice.set(res.data);
        this.isActionSubmitting.set(false);
        this.closeActionDialog();
        this.toast.success(`Invoice ${action === 'send' ? 'sent' : action === 'pay' ? 'marked as paid' : action === 'partial-pay' ? 'partially paid' : 'cancelled'}`);
      },
      error: () => {
        this.isActionSubmitting.set(false);
        this.toast.error(`Failed to ${action} invoice`);
      },
    });
  }


  generatePdf(): void {
    this.isGeneratingPdf.set(true);
    this.invoiceService.generatePdf(this.invoiceId).subscribe({
      next: (res) => {
        this.invoice.set(res.data);
        this.isGeneratingPdf.set(false);
        if (res.data.attachmentId) {
          this.toast.success('PDF generated', 'Downloading...');
          this.downloadPdf(res.data.attachmentId);
        } else {
          this.toast.success('PDF generated');
        }
      },
      error: () => {
        this.isGeneratingPdf.set(false);
        this.toast.error('Failed to generate PDF');
      },
    });
  }

  downloadPdf(attachmentId: string): void {
    this.attachmentService.download(attachmentId).subscribe({
      next: (res) => {
        if (res.data?.url) {
          window.open(res.data.url, '_blank');
        }
      },
      error: () => this.toast.error('Failed to download PDF'),
    });
  }


  editInvoice(): void {
    this.toast.info('Edit functionality — use the fields on this page');
  }

  async deleteInvoice(): Promise<void> {
    const inv = this.invoice();
    if (!inv) return;
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Invoice',
      message: `Permanently delete ${inv.invoiceNumber}? This action cannot be undone.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;

    this.invoiceService.deleteInvoice(this.invoiceId).subscribe({
      next: () => {
        this.toast.success('Invoice deleted');
        this.goBack();
      },
      error: () => this.toast.error('Failed to delete invoice'),
    });
  }
}
