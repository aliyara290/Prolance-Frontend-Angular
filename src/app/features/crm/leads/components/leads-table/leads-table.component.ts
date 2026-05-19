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
import { Lead, LeadStatus, Priority, Source } from '../../types/lead.model';
import { LeadsService } from '../../services/leads.service';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../../shared/ui/dropdown-menu/dropdown-menu.component';

interface SelectOption {
  label: string;
  value: string;
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
    DropdownMenuComponent,
    RouterModule,
  ],
  templateUrl: './leads-table.component.html',
  styleUrls: ['./leads-table.component.css'],
})
export class LeadsTableComponent {
  private readonly leadsService = inject(LeadsService);

  @Input({ required: true }) leads: Lead[] = [];
  @Input() totalCount = 0;

  @Output() editLead = new EventEmitter<Lead>();

  @ViewChild('dt') dt!: Table;

  readonly statusOptions: SelectOption[] = [
    { label: 'New', value: 'NEW' },
    { label: 'Contacted', value: 'CONTACTED' },
    { label: 'Qualified', value: 'QUALIFIED' },
    { label: 'Unqualified', value: 'UNQUALIFIED' },
  ];

  readonly sourceOptions: SelectOption[] = [
    { label: 'Website', value: 'WEBSITE' },
    { label: 'Referral', value: 'REFERRAL' },
    { label: 'Social Media', value: 'SOCIAL_MEDIA' },
    { label: 'Cold Call', value: 'COLD_CALL' },
    { label: 'Event', value: 'EVENT' },
    { label: 'Other', value: 'OTHER' },
  ];

  readonly priorityOptions: SelectOption[] = [
    { label: 'High', value: 'HIGH' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Low', value: 'LOW' },
  ];

  filterSource: string | null = null;
  filterStatus: string | null = null;
  filterPriority: string | null = null;

  getSeverity(status: LeadStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<LeadStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      NEW: 'info',
      CONTACTED: 'warn',
      QUALIFIED: 'success',
      UNQUALIFIED: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  getPrioritySeverity(priority: Priority): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<Priority, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      HIGH: 'danger',
      MEDIUM: 'warn',
      LOW: 'info',
    };
    return map[priority] ?? 'secondary';
  }

  clearFilters(): void {
    this.filterSource = null;
    this.filterStatus = null;
    this.filterPriority = null;
    this.dt.clear();
  }

  readonly moreActions: DropdownMenuItem[] = [
    { label: 'Edit Lead', value: 'edit' },
    { label: 'Convert to Deal', value: 'convert' },
    { label: 'Delete Lead', value: 'delete', danger: true, dividerBefore: true },
  ];

  onMoreAction(item: DropdownMenuItem, lead: Lead): void {
    if (item.value === 'edit') {
      this.editLead.emit(lead);
    } else if (item.value === 'delete') {
      if (confirm(`Are you sure you want to delete lead "${lead.title}"?`)) {
        this.leadsService.deleteLead(lead.id).subscribe({
          next: () => console.log('Lead deleted successfully'),
          error: (err) => console.error('Failed to delete lead', err)
        });
      }
    } else if (item.value === 'convert') {
      if (confirm(`Are you sure you want to convert lead "${lead.title}" to a deal?`)) {
        this.leadsService.convertToDeal(lead.id).subscribe({
          next: (res) => {
            alert('Lead converted to deal successfully!');
            this.leadsService.loadLeads();
          },
          error: (err) => {
            console.error('Failed to convert lead', err);
            alert('Failed to convert lead to deal.');
          }
        });
      }
    }
  }
}
