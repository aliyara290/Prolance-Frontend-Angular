import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutStateService } from '../../services/layout-state.service';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { LucideAngularModule, Calendar, Plus, Settings } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, UserMenuComponent, LucideAngularModule],
  templateUrl: "header.component.html"
})
export class HeaderComponent {
  layoutState = inject(LayoutStateService);

  protected readonly visualViewport = visualViewport;

  icons = {
    plus: Plus,
    settings: Settings,
    calendar: Calendar
  }
}
