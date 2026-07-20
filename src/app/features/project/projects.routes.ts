import { Routes } from '@angular/router';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/projects-list/projects-page.component').then(m => m.ProjectsPageComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/project-form/project-form-page.component').then(m => m.ProjectFormPageComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/project-form/project-form-page.component').then(m => m.ProjectFormPageComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/project-details/layout/project-detail-layout.component').then(
        m => m.ProjectDetailLayoutComponent
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/project-details/dashboard/project-detail-dashboard-page.component').then(
            m => m.ProjectDetailDashboardPageComponent
          ),
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/project-details/overview/project-detail-overview-page.component').then(
            m => m.ProjectDetailOverviewPageComponent
          ),
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./pages/project-details/tasks/project-detail-tasks-page.component').then(
            m => m.ProjectDetailTasksPageComponent
          ),
      },
      {
        path: 'members',
        loadComponent: () =>
          import('./pages/project-details/members/project-detail-members-page.component').then(
            m => m.ProjectDetailMembersPageComponent
          ),
      },
      {
        path: 'issues',
        loadComponent: () =>
          import('./pages/project-details/issues/project-detail-issues-page.component').then(
            m => m.ProjectDetailIssuesPageComponent
          ),
      },
      {
        path: 'milestones',
        loadComponent: () =>
          import('./pages/project-details/milestones/project-detail-milestones-page.component').then(
            m => m.ProjectDetailMilestonesPageComponent
          ),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./pages/project-details/documents/project-detail-documents-page.component').then(
            m => m.ProjectDetailDocumentsPageComponent
          ),
      },
      {
        path: 'activity',
        loadComponent: () =>
          import('./pages/project-details/activity/project-detail-activity-page.component').then(
            m => m.ProjectDetailActivityPageComponent
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
