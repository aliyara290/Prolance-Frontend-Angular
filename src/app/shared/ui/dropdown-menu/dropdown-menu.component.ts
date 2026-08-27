import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';

export interface DropdownMenuItem {
  label: string;
  value: string;
  danger?: boolean;
  disabled?: boolean;
  dividerBefore?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [CommonModule, OverlayModule],
  templateUrl: './dropdown-menu.component.html',
})
export class DropdownMenuComponent {
  @Input({ required: true }) items: DropdownMenuItem[] = [];

  @Input() buttonLabel = 'Actions';

  @Input() iconOnly = false;

  @Input() splitChevron = false;

  @Input() align: 'left' | 'right' = 'right';

  @Output() itemSelected = new EventEmitter<DropdownMenuItem>();

  isOpen = signal(false);

  constructor(private readonly elementRef: ElementRef) {}

  toggle(): void {
    this.isOpen.update(value => !value);
  }

  close(): void {
    this.isOpen.set(false);
  }

  selectItem(item: DropdownMenuItem): void {
    if (item.disabled) return;
    this.itemSelected.emit(item);
    this.close();
  }
}
