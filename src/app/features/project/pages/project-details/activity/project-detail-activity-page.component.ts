import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDetailService } from '../../../services/project-detail.service';

@Component({
  selector: 'app-project-detail-activity-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-detail-activity-page.component.html',
})
export class ProjectDetailActivityPageComponent {
  readonly detailService = inject(ProjectDetailService);
}
