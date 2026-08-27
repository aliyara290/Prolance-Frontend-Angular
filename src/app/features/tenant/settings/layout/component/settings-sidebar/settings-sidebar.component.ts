import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import {
  LucideAngularModule,
  User,
  Users,
  Settings,
  Bell,
  ArrowLeft,
  LucideIconData,
} from 'lucide-angular';

@Component({
  selector: 'app-settings-sidebar',
  standalone: true,
  imports: [RouterModule, LucideAngularModule, NgIf],
  templateUrl: './settings-sidebar.component.html',
  styleUrls: ['./settings-sidebar.component.css'],
})
export class SettingsSidebarComponent {
  readonly ArrowLeft = ArrowLeft;

  navItems: { label: string; icon: LucideIconData; route: string }[] = [
    { label: 'Personal Settings', icon: User, route: '/app/settings/personal' },
    { label: 'Users', icon: Users, route: '/app/settings/users' },
    { label: 'Workspace Settings', icon: Settings, route: '/app/settings/workspace' },
    { label: 'Notifications', icon: Bell, route: '/app/settings/notifications' },
  ];
}
