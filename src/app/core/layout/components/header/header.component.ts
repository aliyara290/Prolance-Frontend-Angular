import {Component, ElementRef, HostListener, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {LayoutStateService} from '../../services/layout-state.service';
import {UserMenuComponent} from '../user-menu/user-menu.component';
import {
  LucideAngularModule,
  Calendar,
  Plus,
  Settings,
  Target,
  Handshake,
  Goal,
  ContactRound,
  Bell,
  Building2
} from 'lucide-angular';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {WorkspaceSwitcherComponent} from '../workspace-switcher/workspace-switcher.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, UserMenuComponent, LucideAngularModule, RouterLink, RouterLinkActive, WorkspaceSwitcherComponent],
  templateUrl: "header.component.html"
})
export class HeaderComponent {
  layoutState = inject(LayoutStateService);
  private elementRef = inject(ElementRef);
  private router = inject(Router);

  protected readonly visualViewport = visualViewport;

  isQuickActionsOpen = signal(false);

  icons = {
    plus: Plus,
    settings: Settings,
    calendar: Calendar,
    project: Target,
    deal: Handshake,
    opportunity: Goal,
    contact: ContactRound,
    client: Building2,
    notification: Bell
  };

  quickActions = [
    {
      label: 'New Lead',
      icon: this.icons.opportunity,
      route: '/app/crm/leads/create',
      color: 'bg-sky-700'
    },
    {
      label: 'New Contact',
      icon: this.icons.contact,
      route: '/app/crm/contacts/create',
      color: 'bg-violet-500'
    },
    {
      label: 'New Client',
      icon: this.icons.client,
      route: '/app/crm/clients/create',
      color: 'bg-pink-500'
    },
    {
      label: 'New Deal',
      icon: this.icons.deal,
      route: '/app/crm/deals/create',
      color: 'bg-amber-500'
    },
    {
      label: 'New Project',
      icon: this.icons.project,
      route: '/app/projects/all/create',
      color: 'bg-emerald-500'
    },
    {
      label: 'New Milestone',
      icon: this.icons.project,
      route: '/app/projects/milestones/create',
      color: 'bg-cyan-500'
    },
    {
      label: 'New Member',
      icon: this.icons.project,
      route: '/app/settings/users',
      color: 'bg-rose-500'
    }
  ];

  toggleQuickActions(event: Event): void {
    event.stopPropagation();
    this.isQuickActionsOpen.update(v => !v);
  }

  navigateQuickAction(route: string): void {
    this.isQuickActionsOpen.set(false);
    this.router.navigate([route]);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isQuickActionsOpen.set(false);
    }
  }
}
