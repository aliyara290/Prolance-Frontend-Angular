import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthRoles } from '../../../auth/store/auth.selectors';
import { LayoutStateService } from '../../services/layout-state.service';
import { NAVIGATION_CONFIG } from '../../config/navigation.config';
import { WorkspaceSwitcherComponent } from '../workspace-switcher/workspace-switcher.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, WorkspaceSwitcherComponent],
  templateUrl: "sidebar.component.html",
})
export class SidebarComponent {
  layoutState = inject(LayoutStateService);
  private store = inject(Store);

  private userRolesSignal = this.store.selectSignal(selectAuthRoles);

  visibleNavItems = computed(() => {
    const roles = this.userRolesSignal() || [];
    return NAVIGATION_CONFIG.filter(item => {
      if (item.hidden) return false;
      if (item.roles && item.roles.length > 0) {
        return item.roles.some(role => roles.includes(role));
      }
      return true;
    });
  });
}
