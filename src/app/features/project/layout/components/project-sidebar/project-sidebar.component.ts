import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { LayoutStateService } from '../../../../../core/layout/services/layout-state.service';
import {
  PROJECT_OVERVIEW_NAV,
  PROJECT_CURRENT_NAV,
  ProjectNavSection,
} from '../../config/project-nav.config';
import { ProjectsService } from '../../../services/projects.service';
import { ProjectsNames } from '../../../types/project.model';

@Component({
  selector: 'app-project-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './project-sidebar.component.html',
  styleUrls: ['./project-sidebar.component.css'],
})
export class ProjectSidebarComponent implements OnInit {
  private readonly router = inject(Router);
  readonly layoutState = inject(LayoutStateService);
  private projectsService = inject(ProjectsService);

  readonly activeTab = signal<'projects' | 'CRM'>('projects');

  readonly overviewNav: ProjectNavSection = PROJECT_OVERVIEW_NAV;
  readonly currentProjectNav: ProjectNavSection = PROJECT_CURRENT_NAV;
  readonly recentProjects = this.projectsService.projectNames;

  ngOnInit() {
    this.projectsService.loadProjectNames();
  }

  readonly icons = {
    plus: Plus,
  };

  toggleTab(): void {
    this.activeTab.set(this.activeTab() === 'projects' ? 'CRM' : 'projects');
  }
}
