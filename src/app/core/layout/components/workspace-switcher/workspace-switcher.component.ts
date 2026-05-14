import {Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {LayoutStateService} from '../../services/layout-state.service';

@Component({
  selector: 'app-workspace-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "workspace-switcher.component.html"
})
export class WorkspaceSwitcherComponent {
  public layoutService = inject(LayoutStateService);

}
