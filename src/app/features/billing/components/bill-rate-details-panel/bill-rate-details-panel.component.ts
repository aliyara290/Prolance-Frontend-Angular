import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { BillRateResponse } from '../../types/bill-rate.types';
import { WorkspaceUser } from '../../../tenant/settings/users/models/user.models';
import { LucideAngularModule, X } from 'lucide-angular';
import { formatCurrency, formatDate } from '../../utils/billing.utils';
import { SENIORITY_LEVEL_LABELS, EDUCATION_LEVEL_LABELS } from '../../types/billing.enums';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../shared/ui/dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-bill-rate-details-panel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TitleCasePipe, DropdownMenuComponent],
  templateUrl: './bill-rate-details-panel.component.html',
  styleUrls: ['./bill-rate-details-panel.component.css']
})
export class BillRateDetailsPanelComponent implements OnInit {
  @Input() isOpen = false;
  @Input() rate: BillRateResponse | null = null;
  @Input() user: WorkspaceUser | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<BillRateResponse>();
  @Output() deleteRequested = new EventEmitter<BillRateResponse>();

  readonly icons = {
    x: X
  };

  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;

  get panelMenuItems(): DropdownMenuItem[] {
    return [
      { label: 'Edit', value: 'edit' },
      { label: 'Delete', value: 'delete', danger: true }
    ];
  }

  ngOnInit(): void {
  }



  onMenuItemClick(item: DropdownMenuItem): void {
    if (!this.rate) return;

    if (item.value === 'edit') {
      this.editRequested.emit(this.rate);
    } else if (item.value === 'delete') {
      this.deleteRequested.emit(this.rate);
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('panel-backdrop')) {
      this.onClose();
    }
  }

  getAvatarInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getSeniorityLabel(level: string | undefined): string {
    if (!level) return 'Unknown';
    return (SENIORITY_LEVEL_LABELS as any)[level] || level;
  }

  getEducationLabel(level: string | undefined): string {
    if (!level) return 'Unknown';
    return (EDUCATION_LEVEL_LABELS as any)[level] || level;
  }
}
