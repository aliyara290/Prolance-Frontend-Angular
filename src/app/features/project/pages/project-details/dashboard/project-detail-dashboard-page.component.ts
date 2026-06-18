import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDetailService } from '../../../services/project-detail.service';

@Component({
  selector: 'app-project-detail-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-detail-dashboard-page.component.html',
})
export class ProjectDetailDashboardPageComponent {
  readonly detailService = inject(ProjectDetailService);
}
