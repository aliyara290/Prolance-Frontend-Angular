import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ErrorMessageComponent } from '../../../../shared/ui/error-message/error-message.component';

import { Router } from '@angular/router';
import { ClientsService } from '../services/clients.service';
import { ClientsTableComponent } from '../components/clients-table/clients-table.component';
import { ModuleHeaderComponent } from '../../../../shared/ui/module-header/module-header.component';
import { ModuleTab, ModuleHeaderAction } from '../../../../shared/ui/module-header/module-header.types';
import { DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { Client } from '../types/client.model';
import {
  EntityListSkeletonComponent
} from '../../../../shared/ui/skeletons/entity-list-skeleton/entity-list-skeleton.component';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModuleHeaderComponent, ClientsTableComponent, EntityListSkeletonComponent, ErrorMessageComponent],
  templateUrl: './clients-page.component.html',
})
export class ClientsPageComponent implements OnInit {
  private readonly clientsService = inject(ClientsService);
  private readonly router = inject(Router);

  readonly clients = this.clientsService.clients;
  readonly totalCount = this.clientsService.totalCount;
  readonly loading = this.clientsService.loading;
  readonly error = this.clientsService.error;

  readonly tabs: ModuleTab[] = [
    { id: 'all', label: 'All Clients', count: this.clientsService.totalCount() },
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' }
  ];

  readonly activeTabId = signal<string>('all');

  readonly primaryActionItems: DropdownMenuItem[] = [
    { label: 'Import Clients', value: 'import' },
    { label: 'Import from CSV', value: 'import-csv', dividerBefore: true },
    { label: 'Import History', value: 'import-history' },
  ];

  readonly moreActions: ModuleHeaderAction[] = [
    { label: 'Export Clients', value: 'export' },
    { label: 'Mass Update', value: 'mass-update', dividerBefore: true },
    { label: 'Delete All Clients', value: 'delete-all', danger: true, dividerBefore: true },
  ];

  readonly tabMoreItems: ModuleHeaderAction[] = [
    { label: 'Create View', value: 'create-view' },
    { label: 'Manage Views', value: 'manage-views' },
  ];

  ngOnInit(): void {
    this.clientsService.loadClients();
  }

  onRefresh(): void {
    this.clientsService.loadClients();
  }

  onTabChange(tab: ModuleTab): void {
    this.activeTabId.set(tab.id);
  }

  onCreate(): void {
    this.router.navigate(['/app/crm/clients/create']);
  }

  onEditClient(client: Client): void {
    this.router.navigate(['/app/crm/clients', client.id, 'edit']);
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
