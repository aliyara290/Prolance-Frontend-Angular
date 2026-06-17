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
import { Client, ClientStatus, ClientType, ClientSource } from '../../types/client.model';
import { ClientsService } from '../../services/clients.service';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-clients-table',
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
  templateUrl: './clients-table.component.html',
  styleUrls: ['./clients-table.component.css'],
})
export class ClientsTableComponent {
  private readonly clientsService = inject(ClientsService);
  private readonly searchSubject = new Subject<string>();

  @Input({ required: true }) clients: Client[] = [];
  @Input() totalCount = 0;

  @Output() editClient = new EventEmitter<Client>();

  @ViewChild('dt') dt!: Table;

  readonly statusOptions: SelectOption[] = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
    { label: 'Archived', value: 'ARCHIVED' },
  ];

  readonly typeOptions: SelectOption[] = [
    { label: 'B2B', value: 'B2B' },
    { label: 'B2C', value: 'B2C' },
    { label: 'Enterprise', value: 'ENTERPRISE' },
    { label: 'Startup', value: 'STARTUP' },
  ];

  readonly sourceOptions: SelectOption[] = [
    { label: 'Website', value: 'WEBSITE' },
    { label: 'Referral', value: 'REFERRAL' },
    { label: 'Social Media', value: 'SOCIAL_MEDIA' },
    { label: 'Cold Call', value: 'COLD_CALL' },
    { label: 'Event', value: 'EVENT' },
    { label: 'Other', value: 'OTHER' },
  ];

  filterStatus: string | null = null;
  filterType: string | null = null;
  filterSource: string | null = null;

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      if (searchTerm && searchTerm.length >= 2) {
        this.clientsService.loadClients(undefined, undefined, searchTerm);
      } else if (!searchTerm) {
        this.clientsService.loadClients();
      }
    });
  }

  onGlobalSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(value, 'contains');
    this.searchSubject.next(value);
  }

  getStatusSeverity(status: ClientStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<ClientStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      ACTIVE: 'success',
      INACTIVE: 'warn',
      ARCHIVED: 'secondary',
    };
    return map[status] ?? 'secondary';
  }

  getTypeSeverity(type: ClientType): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<ClientType, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      ENTERPRISE: 'info',
      STARTUP: 'warn',
      B2B: 'success',
      B2C: 'secondary',
    };
    return map[type] ?? 'secondary';
  }

  clearFilters(): void {
    this.filterStatus = null;
    this.filterType = null;
    this.filterSource = null;
    this.dt.clear();
    this.clientsService.loadClients();
  }

  readonly moreActions: DropdownMenuItem[] = [
    { label: 'Edit Client', value: 'edit' },
    { label: 'Delete Client', value: 'delete', danger: true, dividerBefore: true },
  ];

  onMoreAction(item: DropdownMenuItem, client: Client): void {
    if (item.value === 'edit') {
      this.editClient.emit(client);
    } else if (item.value === 'delete') {
      if (confirm(`Are you sure you want to delete client "${client.name}"?`)) {
        this.clientsService.deleteClient(client.id).subscribe({
          next: () => console.log('Client deleted successfully'),
          error: (err) => console.error('Failed to delete client', err)
        });
      }
    }
  }
}
