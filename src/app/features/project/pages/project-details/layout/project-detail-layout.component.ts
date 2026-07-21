import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule, RouterLinkActive } from '@angular/router';
import { ArrowLeft, RefreshCw, LucideAngularModule } from 'lucide-angular';
import { ProjectDetailService } from '../../../services/project-detail.service';
import { ProjectsService } from '../../../services/projects.service';
import { DetailsSkeletonComponent } from '../../../../../shared/ui/skeletons/details-skeleton/details-skeleton.component';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../../shared/ui/dropdown-menu/dropdown-menu.component';

interface DetailTab {
  id: string;
  label: string;
  route: string;
}

import { ConfirmModalService } from '../../../../../shared/ui/confirm-modal/confirm-modal.service';

@Component({
  selector: 'app-project-detail-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLinkActive,
    LucideAngularModule,
    DetailsSkeletonComponent,
    DropdownMenuComponent,
  ],
  templateUrl: './project-detail-layout.component.html',
  styleUrls: ['./project-detail-layout.component.css'],
})
export class ProjectDetailLayoutComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly detailService = inject(ProjectDetailService);
  private readonly projectsService = inject(ProjectsService);
  private readonly confirmService = inject(ConfirmModalService);

  readonly ArrowLeft = ArrowLeft;
  readonly RefreshCw = RefreshCw;

  readonly tabs: DetailTab[] = [
    { id: 'dashboard', label: 'Dashboard', route: 'dashboard' },
    { id: 'overview', label: 'Overview', route: 'overview' },
    { id: 'tasks', label: 'Tasks', route: 'tasks' },
    { id: 'members', label: 'Members', route: 'members' },
    // { id: 'issues', label: 'Issues', route: 'issues' },
    { id: 'milestones', label: 'Milestones', route: 'milestones' },
    { id: 'documents', label: 'Documents', route: 'documents' },
    { id: 'activity', label: 'Activity', route: 'activity' },
  ];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.detailService.loadProject(id);
      } else {
        this.detailService.error.set('No Project ID provided in route.');
        this.detailService.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.detailService.clear();
  }

  reloadProject(): void {
    const project = this.detailService.project();
    if (project) {
      this.detailService.loadProject(project.id);
    }
  }

  onEdit(): void {
    const project = this.detailService.project();
    if (project) {
      this.router.navigate(['/app/projects/all', project.id, 'edit']);
    }
  }

  async onDelete(): Promise<void> {
    const project = this.detailService.project();
    if (!project) return;
    
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Project',
      message: `Are you sure you want to delete project "${project.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });
    
    if (confirmed) {
      this.projectsService.deleteProject(project.id).subscribe({
        next: () => {
          this.router.navigate(['/app/projects/all']);
        },
        error: (err) => {
          console.error('Failed to delete project', err);
          alert('Failed to delete project.');
        },
      });
    }
  }

  readonly moreActions: DropdownMenuItem[] = [
    { label: 'Edit Project', value: 'edit' },
    { label: 'Delete Project', value: 'delete', danger: true, dividerBefore: true },
  ];

  onMoreAction(item: DropdownMenuItem): void {
    if (item.value === 'edit') {
      this.onEdit();
    } else if (item.value === 'delete') {
      this.onDelete();
    }
  }
}
