import { Component, forwardRef, Input, computed, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { LucideAngularModule, Search, ChevronDown, Check } from 'lucide-angular';

export interface CustomSelectOption {
  value: any;
  label: string;
  subLabel?: string;
  avatarName?: string;
  avatarColor?: string;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './custom-select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ]
})
export class CustomSelectComponent implements ControlValueAccessor {
  @Input() options: CustomSelectOption[] = [];
  @Input() placeholder = '— Select —';
  @Input() searchable = true;
  @Input() nullOptionLabel?: string;
  
  disabled = false;

  readonly isDropdownOpen = signal(false);
  readonly searchQuery = signal('');
  
  dropdownPosition: 'bottom' | 'top' = 'bottom';
  
  private innerValue: any = null;

  onChange: any = () => {};
  onTouched: any = () => {};

  readonly icons = {
    chevronDown: ChevronDown,
    search: Search,
    check: Check
  };

  constructor(private readonly elementRef: ElementRef) {}

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChange(v);
    }
  }

  writeValue(value: any): void {
    this.innerValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  readonly filteredOptions = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.options;
    return this.options.filter(opt => 
      opt.label.toLowerCase().includes(q) || 
      (opt.subLabel && opt.subLabel.toLowerCase().includes(q))
    );
  });

  get selectedOption(): CustomSelectOption | undefined {
    return this.options.find(opt => opt.value === this.value);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen.set(false);
    }
  }

  toggleDropdown(event: Event): void {
    if (this.disabled) return;
    event.stopPropagation();
    
    if (!this.isDropdownOpen()) {
      this.calculatePosition();
    }
    
    this.isDropdownOpen.update(v => !v);
    if (this.isDropdownOpen()) {
      this.searchQuery.set('');
    }
  }

  private calculatePosition(): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const center = viewportHeight / 2;
    
    if (rect.top > center) {
      this.dropdownPosition = 'top';
    } else {
      this.dropdownPosition = 'bottom';
    }
  }

  selectOption(opt: CustomSelectOption | null): void {
    this.value = opt ? opt.value : null;
    this.onTouched();
    this.isDropdownOpen.set(false);
    this.searchQuery.set('');
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  getAvatarInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getAvatarColor(name: string | undefined, defaultColor?: string): string {
    if (defaultColor) return defaultColor;
    if (!name) return '#ccc';
    const colors = ['#267af7', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6', '#0ea5e9', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}
