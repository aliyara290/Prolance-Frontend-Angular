import { Component, inject, signal, ViewChild, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { LeadsService } from '../services/leads.service';
import { LeadsTableComponent } from '../components/leads-table/leads-table.component';
import { Router } from '@angular/router';
import { ModuleHeaderComponent } from '../../../../shared/ui/module-header/module-header.component';
import { ModuleTab, ModuleHeaderAction } from '../../../../shared/ui/module-header/module-header.types';
import { DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { Lead } from '../types/lead.model';

@Component({
  selector: 'app-leads-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModuleHeaderComponent, LeadsTableComponent],
  templateUrl: './leads-page.component.html',
})
export class LeadsPageComponent implements OnInit {
  private readonly leadsService = inject(LeadsService);

  private readonly router = inject(Router);

  readonly leads = this.leadsService.leads;
  readonly totalCount = this.leadsService.totalCount;
  readonly loading = this.leadsService.loading;
  readonly error = this.leadsService.error;

  readonly tabs: ModuleTab[] = [
    { id: 'all', label: 'All Leads', count: this.leadsService.totalCount() },
    { id: 'mine', label: 'My Leads' }
  ];

  readonly activeTabId = signal<string>('all');

  readonly primaryActionItems: DropdownMenuItem[] = [
    { label: 'Import Leads', value: 'import' },
    { label: 'Import from Google Contacts', value: 'import-google', dividerBefore: true },
    { label: 'Import History', value: 'import-history' },
  ];

  readonly moreActions: ModuleHeaderAction[] = [
    { label: 'Export Leads', value: 'export' },
    { label: 'Merge Leads', value: 'merge' },
    { label: 'Mass Update', value: 'mass-update', dividerBefore: true },
    { label: 'Delete All Leads', value: 'delete-all', danger: true, dividerBefore: true },
  ];

  readonly tabMoreItems: ModuleHeaderAction[] = [
    { label: 'Create View', value: 'create-view' },
    { label: 'Manage Views', value: 'manage-views' },
  ];

  ngOnInit(): void {
    this.leadsService.loadLeads();
  }

  onTabChange(tab: ModuleTab): void {
    this.activeTabId.set(tab.id);
  }

  onCreate(): void {
    this.router.navigate(['/app/crm/leads/create']);
  }

  onEditLead(lead: Lead): void {
    this.router.navigate(['/app/crm/leads', lead.id, 'edit']);
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
