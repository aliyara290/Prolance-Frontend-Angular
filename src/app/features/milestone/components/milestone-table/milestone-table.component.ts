import { Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { Milestone, MilestoneStatus } from '../../types/milestone.model';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-milestone-table',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    TagModule,
    SelectModule,
    DropdownMenuComponent,
    ButtonModule,
  ],
  templateUrl: './milestone-table.component.html',
  styleUrls: ['./milestone-table.component.css'],
})
export class MilestoneTableComponent {
  @Input() milestones: Milestone[] = [];
  @Input() loading: boolean = false;

  @Output() view = new EventEmitter<Milestone>();
  @Output() edit = new EventEmitter<Milestone>();
  @Output() complete = new EventEmitter<Milestone>();
  @Output() delete = new EventEmitter<Milestone>();

  @ViewChild('dt') dt!: Table;

  filterStatus: MilestoneStatus | null = null;

  readonly statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'On Hold', value: 'ON_HOLD' },
    { label: 'Cancelled', value: 'CANCELLED' },
    { label: 'Archived', value: 'ARCHIVED' },
  ];

  readonly moreActions: DropdownMenuItem[] = [
    { label: 'View Details', value: 'view' },
    { label: 'Edit Milestone', value: 'edit' },
    { label: 'Mark Completed', value: 'complete', dividerBefore: true },
    { label: 'Delete', value: 'delete', danger: true, dividerBefore: true },
  ];

  onGlobalSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dt.filterGlobal(target.value, 'contains');
  }

  clearFilters(): void {
    this.dt.clear();
    this.filterStatus = null;
    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
  }

  getStatusSeverity(status: MilestoneStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'ACTIVE': return 'info';
      case 'IN_PROGRESS': return 'info';
      case 'COMPLETED': return 'success';
      case 'ON_HOLD': return 'warn';
      case 'CANCELLED': return 'danger';
      case 'ARCHIVED': return 'secondary';
      default: return 'info';
    }
  }

  onMoreAction(item: DropdownMenuItem, milestone: Milestone): void {
    switch (item.value) {
      case 'view': this.view.emit(milestone); break;
      case 'edit': this.edit.emit(milestone); break;
      case 'complete': this.complete.emit(milestone); break;
      case 'delete': this.delete.emit(milestone); break;
    }
  }
}
