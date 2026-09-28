import { Component, inject, signal, computed, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillRateService } from '../../services/bill-rate.service';
import { BillRateResponse, CreateBillRateRequest, UpdateBillRateRequest } from '../../types/bill-rate.types';
import { SeniorityLevel, EducationLevel } from '../../types/billing.enums';
import { SENIORITY_LEVEL_LABELS, EDUCATION_LEVEL_LABELS } from '../../types/billing.enums';
import { BillRateDialogComponent } from '../../components/bill-rate-dialog/bill-rate-dialog.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { ConfirmModalService } from '../../../../shared/ui/confirm-modal/confirm-modal.service';
import { ProjectsService } from '../../../project/services/projects.service';
import { ProjectMembersService } from '../../../project/services/project-members.service';
import { WorkspaceUser } from '../../../tenant/settings/users/models/user.models';
import { UsersStateService } from '../../../tenant/settings/users/service/users-state.service';
import { BillRateDetailsPanelComponent } from '../../components/bill-rate-details-panel/bill-rate-details-panel.component';
import { CustomSelectOption } from '../../../../shared/ui/custom-select/custom-select.component';
import { formatCurrency, formatDate } from '../../utils/billing.utils';
import { TableModule, Table } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from 'primeng/api';

import { DropdownMenuComponent, DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { EntityListSkeletonComponent } from '../../../../shared/ui/skeletons/entity-list-skeleton/entity-list-skeleton.component';
import { ErrorMessageComponent } from '../../../../shared/ui/error-message/error-message.component';

@Component({
  selector: 'app-bill-rates',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule, 
    FormsModule, 
    BillRateDialogComponent, 
    TableModule, 
    TagModule, 
    SelectModule, 
    InputTextModule, 
    ButtonModule, 
    SharedModule,
    DropdownMenuComponent,
    EntityListSkeletonComponent,
    ErrorMessageComponent,
    BillRateDetailsPanelComponent
  ],
  templateUrl: './bill-rates.component.html',
  styleUrls: ['./bill-rates.component.css'],
})
export class BillRatesComponent implements OnInit {
  private readonly billRateService = inject(BillRateService);
  private readonly projectsService = inject(ProjectsService);
  private readonly membersService = inject(ProjectMembersService);
  private readonly usersState = inject(UsersStateService);
  private readonly toast = inject(ToastService);
  private readonly confirmService = inject(ConfirmModalService);
  private readonly route = inject(ActivatedRoute);

  @ViewChild('dt') dt!: Table;

  readonly rates = signal<BillRateResponse[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly isDialogOpen = signal(false);
  readonly editingRate = signal<BillRateResponse | null>(null);
  readonly isSubmitting = signal(false);

  readonly isDetailsPanelOpen = signal(false);
  readonly selectedRateForDetails = signal<BillRateResponse | null>(null);

  readonly userOptions = computed<CustomSelectOption[]>(() => {
    const members = this.membersService.members();
    const allUsers = this.usersState.usersList();
    return members.map(m => {
      const user = allUsers.find(u => u.id === m.userId || u.keycloakUserId === m.userId);
      const name = user ? `${user.firstName} ${user.lastName}` : `User: ${m.userId}`;
      return { 
        value: user ? user.keycloakUserId : m.userId, 
        label: name, 
        subLabel: m.role,
        avatarName: user ? name : undefined,
        avatarColor: user?.avatarColor
      };
    });
  });

  selectedProjectId = '';
  searchTerm = '';

  filterSeniority: any = null;
  filterEducation: any = null;

  readonly seniorityLabels = SENIORITY_LEVEL_LABELS;
  readonly educationLabels = EDUCATION_LEVEL_LABELS;
  
  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;

  get seniorityOptions() {
    return Object.entries(SENIORITY_LEVEL_LABELS).map(([value, label]) => ({ value, label }));
  }

  get educationOptions() {
    return Object.entries(EDUCATION_LEVEL_LABELS).map(([value, label]) => ({ value, label }));
  }

  get moreActions(): DropdownMenuItem[] {
    return [
      { label: 'Edit', value: 'edit' },
      { label: 'Delete', value: 'delete', danger: true }
    ];
  }

  onMoreAction(action: DropdownMenuItem, rate: BillRateResponse): void {
    if (action.value === 'edit') {
      this.openEditRate(rate);
    } else if (action.value === 'delete') {
      this.deleteRate(rate);
    }
  }

  onRefresh(): void {
    if (this.selectedProjectId) {
      this.loadRates();
    }
  }

  getSeniorityLabel(level: any): string {
    return (this.seniorityLabels as any)[level] || level;
  }

  getEducationLabel(level: any): string {
    return (this.educationLabels as any)[level] || level;
  }

  getUserInfo(userId: string): WorkspaceUser | undefined {
    return this.usersState.usersList().find(u => u.id === userId || u.keycloakUserId === userId);
  }

  openDetailsSidebar(rate: BillRateResponse): void {
    this.selectedRateForDetails.set(rate);
    this.isDetailsPanelOpen.set(true);
  }

  closeDetailsSidebar(): void {
    this.isDetailsPanelOpen.set(false);
    setTimeout(() => this.selectedRateForDetails.set(null), 300);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterSeniority = null;
    this.filterEducation = null;
    if (this.dt) {
      this.dt.clear();
    }
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.selectedProjectId = id;
        this.loadRates();
      }
    });
  }

  loadRates(): void {
    if (!this.selectedProjectId) {
      this.rates.set([]);
      
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.billRateService.getBillRatesByProject(this.selectedProjectId).subscribe({
      next: (res) => {
        this.rates.set(res.data ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Unable to load bill rates for this project.');
        this.isLoading.set(false);
      },
    });

    this.membersService.loadMembers(this.selectedProjectId, 0, 100);
    
  }

  openCreateRate(): void {
    if (!this.selectedProjectId) {
      this.toast.error('Please select a project first');
      return;
    }
    this.editingRate.set(null);
    this.isDialogOpen.set(true);
  }

  openEditRate(rate: BillRateResponse): void {
    this.editingRate.set(rate);
    this.isDialogOpen.set(true);
  }

  closeDialog(): void {
    this.isDialogOpen.set(false);
    this.editingRate.set(null);
  }

  onSubmitted(req: CreateBillRateRequest | UpdateBillRateRequest): void {
    this.isSubmitting.set(true);
    const editing = this.editingRate();

    if (editing) {
      this.billRateService.updateBillRate(editing.id, req as UpdateBillRateRequest).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeDialog();
          this.toast.success('Bill rate updated');
          this.loadRates();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toast.error('Failed to update bill rate');
        },
      });
    } else {
      this.billRateService.createBillRate(req as CreateBillRateRequest).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeDialog();
          this.toast.success('Bill rate created');
          this.loadRates();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toast.error('Failed to create bill rate');
        },
      });
    }
  }

  async deleteRate(rate: BillRateResponse): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Bill Rate',
      message: `Are you sure you want to delete the bill rate for this user? This may affect future invoicing.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;

    this.billRateService.deleteBillRate(rate.id).subscribe({
      next: () => {
        this.toast.success('Bill rate deleted');
        this.rates.update(list => list.filter(r => r.id !== rate.id));
      },
      error: () => this.toast.error('Failed to delete bill rate'),
    });
  }
}
