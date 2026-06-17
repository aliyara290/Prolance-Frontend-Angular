import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Target, CheckCircle2, Clock, AlertCircle, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-angular';
import { ModuleHeaderComponent } from '../../../../shared/ui/module-header/module-header.component';

@Component({
  selector: 'app-project-dashboard-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ModuleHeaderComponent],
  templateUrl: './project-dashboard-page.component.html'
})
export class ProjectDashboardPageComponent {
  icons = {
    target: Target,
    check: CheckCircle2,
    clock: Clock,
    alert: AlertCircle,
    up: ArrowUpRight,
    down: ArrowDownRight,
    plus: Plus
  };
}
