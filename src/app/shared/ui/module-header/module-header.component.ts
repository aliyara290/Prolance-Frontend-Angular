import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleTab, ModuleHeaderAction } from './module-header.types';
import { DropdownMenuComponent, DropdownMenuItem } from '../dropdown-menu/dropdown-menu.component';
import { IconWrapperComponent } from '../icon-wrapper/icon-wrapper';
import { Kanban, List, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-module-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './module-header.component.html',
})
export class ModuleHeaderComponent {

  icons = {
    list: List,
    kanban: Kanban,
  }
  /** The page/module title e.g. "Contacts", "Leads" */
  @Input({ required: true }) title!: string;

  /** The list of tabs shown under the title */
  @Input() tabs: ModuleTab[] = [];

  /** The currently active tab id */
  @Input() activeTabId: string | null = null;

  /** Label for the primary CTA button */
  @Input() primaryActionLabel: string = 'Create';

  /** Items in the primary CTA dropdown (the chevron split) */
  @Input() primaryActionItems: DropdownMenuItem[] = [];

  /** Items for the top-right "..." context menu */
  @Input() moreActionItems: ModuleHeaderAction[] = [];

  /** Items for the tab-level "..." menu */
  @Input() tabMoreItems: ModuleHeaderAction[] = [];

  /** Emitted when the active tab changes */
  @Output() tabChange = new EventEmitter<ModuleTab>();

  /** Emitted when primary CTA button is clicked */
  @Output() primaryAction = new EventEmitter<void>();

  /** Emitted when a primary dropdown item is selected */
  @Output() primaryActionSelected = new EventEmitter<DropdownMenuItem>();

  /** Emitted when a more-action item is selected */
  @Output() moreActionSelected = new EventEmitter<ModuleHeaderAction>();

  /** Emitted when the view mode changes (list/kanban) */
  @Output() viewChange = new EventEmitter<'list' | 'kanban'>();

  /** Emitted when a tab-more item is selected */
  @Output() tabMoreSelected = new EventEmitter<ModuleHeaderAction>();

  /** Set the active view from parent */
  @Input() set view(v: 'list' | 'kanban') {
    if (v) {
      this.activeView.set(v);
    }
  }

  // View toggle: 'list' | 'grid'
  readonly activeView = signal<'list' | 'kanban'>('list');

  // Toolbar visibility
  readonly filterPanelOpen = signal(false);

  setActiveTab(tab: ModuleTab): void {
    this.tabChange.emit(tab);
  }

  setView(view: 'list' | 'kanban'): void {
    this.activeView.set(view);
    this.viewChange.emit(view);
  }

  toggleFilterPanel(): void {
    this.filterPanelOpen.update(v => !v);
  }

  onPrimaryAction(): void {
    this.primaryAction.emit();
  }

  onPrimaryActionSelected(item: DropdownMenuItem): void {
    this.primaryActionSelected.emit(item);
  }

  onMoreActionSelected(action: ModuleHeaderAction): void {
    this.moreActionSelected.emit(action);
  }

  onTabMoreSelected(action: ModuleHeaderAction): void {
    this.tabMoreSelected.emit(action);
  }

  // Convert ModuleHeaderAction to DropdownMenuItem for the shared component
  toDropdownItems(actions: ModuleHeaderAction[]): DropdownMenuItem[] {
    return actions.map(a => ({
      label: a.label,
      value: a.value,
      danger: a.danger,
      disabled: a.disabled,
      dividerBefore: a.dividerBefore,
    }));
  }
}
