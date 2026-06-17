import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: 'sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  layoutState = inject(LayoutStateService);
  private store = inject(Store);
  private router = inject(Router);
  private projectsService = inject(ProjectsService);

  readonly activeTab = signal<'projects' | 'CRM'>('CRM');

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
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

  // ── Project nav data ──
  readonly overviewNav: ProjectNavSection = PROJECT_OVERVIEW_NAV;
  readonly currentProjectNav: ProjectNavSection = PROJECT_CURRENT_NAV;
  readonly recentProjects = this.projectsService.projectNames;

  readonly icons = {
    plus: Plus,
  };

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
