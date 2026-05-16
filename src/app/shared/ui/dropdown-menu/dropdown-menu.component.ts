import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
} from '@angular/core';

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
  imports: [CommonModule],
  templateUrl: './dropdown-menu.component.html',
})
export class DropdownMenuComponent {
  @Input({ required: true }) items: DropdownMenuItem[] = [];

  /** Default mode: shows a labelled button with a chevron */
  @Input() buttonLabel = 'Actions';

  /**
   * iconOnly: renders a "⋯" three-dots icon button with no label.
   * Use this for the "..." context menus in Zoho-style headers.
   */
  @Input() iconOnly = false;

  /**
   * splitChevron: renders only the "▾" chevron portion.
   * Use this inside a split primary-action button.
   */
  @Input() splitChevron = false;

  /** Alignment of the dropdown panel relative to the trigger */
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}
