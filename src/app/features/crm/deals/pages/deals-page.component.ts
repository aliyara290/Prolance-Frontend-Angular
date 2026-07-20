import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ErrorMessageComponent } from '../../../../shared/ui/error-message/error-message.component';

import { Router } from '@angular/router';
import { DealsService } from '../services/deals.service';
import { DealsTableComponent } from '../components/deals-table/deals-table.component';
import { ModuleHeaderComponent } from '../../../../shared/ui/module-header/module-header.component';
import { ModuleTab, ModuleHeaderAction } from '../../../../shared/ui/module-header/module-header.types';
import { DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { EntityListSkeletonComponent } from '../../../../shared/ui/skeletons/entity-list-skeleton/entity-list-skeleton.component';
import { Deal } from '../types/deal.model';

@Component({
  selector: 'app-deals-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModuleHeaderComponent, DealsTableComponent, EntityListSkeletonComponent, ErrorMessageComponent],
  templateUrl: './deals-page.component.html',
})
export class DealsPageComponent implements OnInit {
  private readonly dealsService = inject(DealsService);
  private readonly router = inject(Router);

  readonly deals = this.dealsService.deals;
  readonly totalCount = this.dealsService.totalCount;
  readonly loading = this.dealsService.loading;
  readonly error = this.dealsService.error;

  readonly tabs: ModuleTab[] = [
    { id: 'all', label: 'All Deals', count: this.dealsService.totalCount() },
    { id: 'won', label: 'Won' },
    { id: 'lost', label: 'Lost' }
  ];

  readonly activeTabId = signal<string>('all');

  readonly primaryActionItems: DropdownMenuItem[] = [
    { label: 'Import Deals', value: 'import' },
    { label: 'Import from CSV', value: 'import-csv', dividerBefore: true },
    { label: 'Import History', value: 'import-history' },
  ];

  readonly moreActions: ModuleHeaderAction[] = [
    { label: 'Export Deals', value: 'export' },
    { label: 'Mass Update', value: 'mass-update', dividerBefore: true },
    { label: 'Delete All Deals', value: 'delete-all', danger: true, dividerBefore: true },
  ];

  readonly tabMoreItems: ModuleHeaderAction[] = [
    { label: 'Create View', value: 'create-view' },
    { label: 'Manage Views', value: 'manage-views' },
  ];

  ngOnInit(): void {
    this.dealsService.loadDeals();
  }

  onTabChange(tab: ModuleTab): void {
    this.activeTabId.set(tab.id);
  }

  onCreate(): void {
    this.router.navigate(['/app/crm/deals/create']);
  }

  onEditDeal(deal: Deal): void {
    this.router.navigate(['/app/crm/deals', deal.id, 'edit']);
  }

  onPrimaryActionSelected(item: DropdownMenuItem): void {
    console.log('Primary action:', item.value);
  }

  onMoreAction(action: ModuleHeaderAction): void {
    console.log('More action:', action.value);
  }

  onTabMore(action: ModuleHeaderAction): void {
    console.log('Tab more:', action.value);
  }
}
