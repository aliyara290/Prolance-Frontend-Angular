import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutStateService {
  // Layout Signals
  readonly sidebarCollapsed = signal<boolean>(false);
  readonly mobileDrawerOpen = signal<boolean>(false);

  toggleSidebar() {
    this.sidebarCollapsed.update(c => !c);
  }

  toggleMobileDrawer() {
    this.mobileDrawerOpen.update(o => !o);
  }
}
