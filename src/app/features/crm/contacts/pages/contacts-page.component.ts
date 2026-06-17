import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContactsService } from '../services/contacts.service';
import { ContactsTableComponent } from '../components/contacts-table/contacts-table.component';
import { ModuleHeaderComponent } from '../../../../shared/ui/module-header/module-header.component';
import { ModuleTab, ModuleHeaderAction } from '../../../../shared/ui/module-header/module-header.types';
import { DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { EntityListSkeletonComponent } from '../../../../shared/ui/skeletons/entity-list-skeleton/entity-list-skeleton.component';
import { Contact } from '../types/contact.model';

@Component({
  selector: 'app-contacts-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModuleHeaderComponent, ContactsTableComponent, EntityListSkeletonComponent],
  templateUrl: './contacts-page.component.html',
})
export class ContactsPageComponent implements OnInit {
  private readonly contactsService = inject(ContactsService);
  private readonly router = inject(Router);

  readonly contacts = this.contactsService.contacts;
  readonly totalCount = this.contactsService.totalCount;
  readonly loading = this.contactsService.loading;
  readonly error = this.contactsService.error;

  readonly tabs: ModuleTab[] = [
    { id: 'all', label: 'All Contacts', count: this.contactsService.totalCount() },
    { id: 'primary', label: 'Primary' },
    { id: 'secondary', label: 'Secondary' }
  ];

  readonly activeTabId = signal<string>('all');

  readonly primaryActionItems: DropdownMenuItem[] = [
    { label: 'Import Contacts', value: 'import' },
    { label: 'Import from CSV', value: 'import-csv', dividerBefore: true },
    { label: 'Import History', value: 'import-history' },
  ];

  readonly moreActions: ModuleHeaderAction[] = [
    { label: 'Export Contacts', value: 'export' },
    { label: 'Mass Update', value: 'mass-update', dividerBefore: true },
    { label: 'Delete All Contacts', value: 'delete-all', danger: true, dividerBefore: true },
  ];

  readonly tabMoreItems: ModuleHeaderAction[] = [
    { label: 'Create View', value: 'create-view' },
    { label: 'Manage Views', value: 'manage-views' },
  ];

  ngOnInit(): void {
    this.contactsService.loadContacts();
  }

  onTabChange(tab: ModuleTab): void {
    this.activeTabId.set(tab.id);
  }

  onCreate(): void {
    this.router.navigate(['/app/crm/contacts/create']);
  }

  onEditContact(contact: Contact): void {
    this.router.navigate(['/app/crm/contacts', contact.id, 'edit']);
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
