import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { Project, ProjectStatus, ProjectPriority } from '../../types/project.model';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { DetailsSkeletonComponent } from '../../../../shared/ui/skeletons/details-skeleton/details-skeleton.component';

@Component({
  selector: 'app-project-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, DetailsSkeletonComponent],
  templateUrl: './project-details-page.component.html',
})
export class ProjectDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectsService = inject(ProjectsService);

  readonly project = signal<Project | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<'overview' | 'timeline'>('overview');

  readonly ArrowLeft = ArrowLeft;

  ngOnInit(): void {
    this.loadProject();
  }

  loadProject(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No Project ID provided in route.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.projectsService.getProject(id).subscribe({
      next: (res) => {
        this.project.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load project details', err);
        this.error.set('Project not found or failed to load project details.');
        this.loading.set(false);
      },
    });
  }

  onEdit(): void {
    const currentProject = this.project();
    if (currentProject) {
      this.router.navigate(['/app/projects/all', currentProject.id, 'edit']);
    }
  }

  onDelete(): void {
    const currentProject = this.project();
    if (currentProject && confirm(`Are you sure you want to delete project "${currentProject.name}"?`)) {
      this.projectsService.deleteProject(currentProject.id).subscribe({
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

  getStatusColor(status: ProjectStatus): string {
    const map: Record<ProjectStatus, string> = {
      PLANNED: 'var(--color-info)',
      ACTIVE: 'var(--color-success)',
      ON_HOLD: 'var(--color-warning)',
      COMPLETED: 'var(--color-text-muted)',
      CANCELLED: 'var(--color-danger)',
    };
    return map[status] ?? 'var(--color-text-muted)';
  }

  getStatusBg(status: ProjectStatus): string {
    const map: Record<ProjectStatus, string> = {
      PLANNED: 'var(--color-info)',
      ACTIVE: 'var(--color-success)',
      ON_HOLD: 'var(--color-warning)',
      COMPLETED: 'var(--color-text-muted)',
      CANCELLED: 'var(--color-danger)',
    };
    return map[status] ?? 'var(--color-bg-muted)';
  }

  getPriorityColor(priority: ProjectPriority): string {
    const map: Record<ProjectPriority, string> = {
      HIGH: 'var(--color-danger)',
      MEDIUM: 'var(--color-warning)',
      LOW: 'var(--color-success)',
    };
    return map[priority] ?? 'var(--color-text-muted)';
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return 'var(--color-success)';
    if (progress >= 40) return 'var(--color-warning)';
    return 'var(--color-primary)';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
