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
import { Contact, InfluenceLevel, Role } from '../../types/contact.model';
import { ContactsService } from '../../services/contacts.service';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface SelectOption {
  label: string;
  value: string;
}

import { ConfirmModalService } from '../../../../../shared/ui/confirm-modal/confirm-modal.service';

@Component({
  selector: 'app-contacts-table',
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
  templateUrl: './contacts-table.component.html',
  styleUrls: ['./contacts-table.component.css'],
})
export class ContactsTableComponent {
  private readonly contactsService = inject(ContactsService);
  private readonly confirmService = inject(ConfirmModalService);
  private readonly searchSubject = new Subject<string>();

  @Input({ required: true }) contacts: Contact[] = [];
  @Input() totalCount = 0;

  @Output() editContact = new EventEmitter<Contact>();

  @ViewChild('dt') dt!: Table;

  readonly roleOptions: SelectOption[] = [
    { label: 'CEO', value: 'CEO' },
    { label: 'Influencer', value: 'INFLUENCER' },
    { label: 'Director', value: 'DIRECTOR' },
    { label: 'Buyer', value: 'BUYER' },
  ];

  readonly influenceOptions: SelectOption[] = [
    { label: 'High', value: 'HIGH' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Low', value: 'LOW' },
  ];

  filterRole: string | null = null;
  filterInfluence: string | null = null;

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      if (searchTerm && searchTerm.length >= 2) {
        this.contactsService.loadContacts(undefined, undefined, searchTerm);
      } else if (!searchTerm) {
        this.contactsService.loadContacts();
      }
    });
  }

  onGlobalSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(value, 'contains');
    this.searchSubject.next(value);
  }

  getInfluenceSeverity(level: InfluenceLevel): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<InfluenceLevel, 'success' | 'warn' | 'danger'> = {
      HIGH: 'danger',
      MEDIUM: 'warn',
      LOW: 'success',
    };
    return map[level] ?? 'secondary';
  }

  getRoleSeverity(role: Role): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<Role, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      CEO: 'info',
      DIRECTOR: 'success',
      INFLUENCER: 'warn',
      BUYER: 'secondary',
    };
    return map[role] ?? 'secondary';
  }

  clearFilters(): void {
    this.filterRole = null;
    this.filterInfluence = null;
    this.dt.clear();
    this.contactsService.loadContacts();
  }

  readonly moreActions: DropdownMenuItem[] = [
    { label: 'Edit Contact', value: 'edit' },
    { label: 'Delete Contact', value: 'delete', danger: true, dividerBefore: true },
  ];

  async onMoreAction(item: DropdownMenuItem, contact: Contact): Promise<void> {
    if (item.value === 'edit') {
      this.editContact.emit(contact);
    } else if (item.value === 'delete') {
      const confirmed = await this.confirmService.confirm({
        title: 'Delete Contact',
        message: `Are you sure you want to delete contact "${contact.firstName} ${contact.lastName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        danger: true
      });
      if (confirmed) {
        this.contactsService.deleteContact(contact.id).subscribe({
          next: () => console.log('Contact deleted successfully'),
          error: (err) => console.error('Failed to delete contact', err)
        });
      }
    }
  }

  getFullName(contact: Contact): string {
    return `${contact.firstName} ${contact.lastName}`;
  }

  getInitials(contact: Contact): string {
    const f = contact.firstName?.charAt(0) || '';
    const l = contact.lastName?.charAt(0) || '';
    return (f + l).toUpperCase() || '?';
  }

  getAvatarColor(contact: Contact): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
    const idStr = contact.id || '';
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
      hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
}
