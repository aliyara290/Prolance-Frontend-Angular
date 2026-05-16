import {
  Component,
  Input,
  ViewChild,
  ChangeDetectionStrategy,
  ViewEncapsulation,
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
import { Lead, LeadStatus } from '../../types/lead.model';

interface SelectOption {
  label: string;
  value: string;
}

interface OwnerOption {
  name: string;
}

@Component({
  selector: 'app-leads-table',
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
  ],
  templateUrl: './leads-table.component.html',
  styleUrls: ['./leads-table.component.css'],
})
export class LeadsTableComponent {
  @Input({ required: true }) leads: Lead[] = [];
  @Input() totalCount = 0;

  @ViewChild('dt') dt!: Table;

  readonly statusOptions: SelectOption[] = [
    { label: 'New', value: 'new' },
    { label: 'Contacted', value: 'contacted' },
    { label: 'Qualified', value: 'qualified' },
    { label: 'Lost', value: 'lost' },
  ];

  readonly sourceOptions: SelectOption[] = [
    { label: 'Cold Call', value: 'Cold Call' },
    { label: 'Advertisement', value: 'Advertisement' },
    { label: 'Web Download', value: 'Web Download' },
    { label: 'Seminar Partner', value: 'Seminar Partner' },
    { label: 'Online Store', value: 'Online Store' },
    { label: 'Partner', value: 'Partner' },
    { label: 'External Referral', value: 'External Referral' },
  ];

  readonly ownerOptions: OwnerOption[] = [
    { name: 'Ali Yara' },
    { name: 'John Doe' },
  ];

  filterSource: string | null = null;
  filterStatus: string | null = null;
  filterOwner: string[] = [];

  getSeverity(status: LeadStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<LeadStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      new: 'info',
      contacted: 'warn',
      qualified: 'success',
      lost: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  clearFilters(): void {
    this.filterSource = null;
    this.filterStatus = null;
    this.filterOwner = [];
    this.dt.clear();
  }
}
