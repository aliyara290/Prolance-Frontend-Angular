import { Component, computed, inject, signal, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectAuthRoles } from '../../../auth/store/auth.selectors';
import { LayoutStateService } from '../../services/layout-state.service';
import {
  CRM_NAV_SECTIONS,
  CrmNavSection,
} from '../../config/navigation.config';
import {
  LucideAngularModule,
  Plus,
  Search,
  Settings,
  User,
  Bell,
  Briefcase,
  Users
} from 'lucide-angular';
import {
  PROJECT_OVERVIEW_NAV,
  PROJECT_CURRENT_NAV,
  ProjectNavSection,
} from '../../../../features/project/layout/config/project-nav.config';
import { ProjectsService } from '../../../../features/project/services/projects.service';
import { ProjectsNames } from '../../../../features/project/types/project.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: 'sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  layoutState = inject(LayoutStateService);
  private store = inject(Store);
  private router = inject(Router);
  private projectsService = inject(ProjectsService);

  readonly activeTab = signal<'projects' | 'CRM'>('CRM');

  readonly icons = {
    plus: Plus,
    search: Search,
    settings: Settings,
    user: User,
    users: Users,
    bell: Bell,
    briefcase: Briefcase
  };

  isSettingsMenuOpen = signal(false);

  constructor(private readonly elementRef: ElementRef) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.isSettingsMenuOpen.set(false); // Close menu on navigation
      if (event.urlAfterRedirects.includes('/app/projects')) {
        this.activeTab.set('projects');
      } else {
        this.activeTab.set('CRM');
      }
    });
  }

  ngOnInit() {
    this.projectsService.loadProjectNames();
  }

  readonly overviewNav: ProjectNavSection = PROJECT_OVERVIEW_NAV;
  readonly currentProjectNav: ProjectNavSection = PROJECT_CURRENT_NAV;
  
  readonly projectSearchQuery = signal<string>('');
  
  readonly displayedProjects = computed(() => {
    const query = this.projectSearchQuery().toLowerCase();
    const allProjects = this.projectsService.projectNames();
    
    if (!query) {
      return allProjects.slice(0, 5);
    }
    
    return allProjects.filter(p => p.name.toLowerCase().includes(query));
  });
  
  readonly loadingProjects = this.projectsService.loadingNames;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // If click is outside the settings button/menu, close it
    const target = event.target as HTMLElement;
    if (!target.closest('#sidebar-settings-container')) {
      this.isSettingsMenuOpen.set(false);
    }
  }

  toggleSettingsMenu(): void {
    this.isSettingsMenuOpen.update(val => !val);
  }

  toggleTab(): void {
    this.activeTab.set(this.activeTab() === 'projects' ? 'CRM' : 'projects');
  }

  // ── CRM nav data (filtered by roles) ──
  private userRolesSignal = this.store.selectSignal(selectAuthRoles);

  readonly crmNavSections = computed<CrmNavSection[]>(() => {
    const roles = this.userRolesSignal() || [];
    return CRM_NAV_SECTIONS.map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (item.hidden) return false;
        if (item.roles && item.roles.length > 0) {
          return item.roles.some(role => roles.includes(role));
        }
        return true;
      }),
    })).filter(section => section.items.length > 0);
  });
}
