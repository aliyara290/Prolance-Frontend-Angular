import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users, Handshake, Goal, Activity, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-angular';
import { ModuleHeaderComponent } from '../../../../shared/ui/module-header/module-header.component';

@Component({
  selector: 'app-temp-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ModuleHeaderComponent],
  templateUrl: "temp-dashboard.component.html"
})
export class TempDashboardComponent {
  icons = {
    users: Users,
    deals: Handshake,
    leads: Goal,
    activity: Activity,
    up: ArrowUpRight,
    down: ArrowDownRight,
    trending: TrendingUp
  };
}
