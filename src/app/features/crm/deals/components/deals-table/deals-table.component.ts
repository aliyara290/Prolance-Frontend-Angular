import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { Deal, Stage, Priority } from '../../types/deal.model';
import { DealsService } from '../../services/deals.service';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface SelectOption {
  label: string;
  value: string;
}

import { ConfirmModalService } from '../../../../../shared/ui/confirm-modal/confirm-modal.service';

@Component({
  selector: 'app-deals-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    SharedModule,
    DropdownMenuComponent,
    RouterModule,
  ],
  templateUrl: './deals-table.component.html',
  styleUrls: ['./deals-table.component.css'],
})
export class DealsTableComponent {
  private readonly dealsService = inject(DealsService);
  private readonly confirmService = inject(ConfirmModalService);
  private readonly searchSubject = new Subject<string>();

  @Input({ required: true }) deals: Deal[] = [];
  @Input() totalCount = 0;

  @Output() editDeal = new EventEmitter<Deal>();

  @ViewChild('dt') dt!: Table;

  readonly stageOptions: SelectOption[] = [
    { label: 'Prospecting', value: 'PROSPECTING' },
    { label: 'Qualification', value: 'QUALIFICATION' },
    { label: 'Proposal', value: 'PROPOSAL' },
    { label: 'Negotiation', value: 'NEGOTIATION' },
    { label: 'Won', value: 'WON' },
    { label: 'Lost', value: 'LOST' },
  ];

  readonly priorityOptions: SelectOption[] = [
    { label: 'High', value: 'HIGH' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Low', value: 'LOW' },
  ];

  filterStage: string | null = null;
  filterPriority: string | null = null;

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      if (searchTerm && searchTerm.length >= 2) {
        this.dealsService.loadDeals(undefined, undefined, searchTerm);
      } else if (!searchTerm) {
        this.dealsService.loadDeals();
      }
    });
  }

  onGlobalSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(value, 'contains');
    this.searchSubject.next(value);
  }

  getStageSeverity(stage: Stage): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<Stage, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      PROSPECTING: 'secondary',
      QUALIFICATION: 'info',
      PROPOSAL: 'warn',
      NEGOTIATION: 'warn',
      WON: 'success',
      LOST: 'danger',
    };
    return map[stage] ?? 'secondary';
  }

  getPrioritySeverity(priority: Priority): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<Priority, 'success' | 'warn' | 'danger'> = {
      HIGH: 'danger',
      MEDIUM: 'warn',
      LOW: 'success',
    };
    return map[priority] ?? 'secondary';
  }

  clearFilters(): void {
    this.filterStage = null;
    this.filterPriority = null;
    this.dt.clear();
    this.dealsService.loadDeals();
  }

  readonly moreActions: DropdownMenuItem[] = [
    { label: 'Edit Deal', value: 'edit' },
    { label: 'Delete Deal', value: 'delete', danger: true, dividerBefore: true },
  ];

  async onMoreAction(item: DropdownMenuItem, deal: Deal): Promise<void> {
    if (item.value === 'edit') {
      this.editDeal.emit(deal);
    } else if (item.value === 'delete') {
      const confirmed = await this.confirmService.confirm({
        title: 'Delete Deal',
        message: `Are you sure you want to delete deal "${deal.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        danger: true
      });
      if (confirmed) {
        this.dealsService.deleteDeal(deal.id).subscribe({
          next: () => console.log('Deal deleted successfully'),
          error: (err) => console.error('Failed to delete deal', err)
        });
      }
    }
  }
}
