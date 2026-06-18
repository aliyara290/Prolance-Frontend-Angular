import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDetailService } from '../../../services/project-detail.service';

@Component({
  selector: 'app-project-detail-overview-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-detail-overview-page.component.html',
  styleUrls: ['./project-detail-overview-page.component.css'],
})
export class ProjectDetailOverviewPageComponent {
  readonly detailService = inject(ProjectDetailService);
}

