import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDetailService } from '../../../services/project-detail.service';

@Component({
  selector: 'app-project-detail-milestones-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-detail-milestones-page.component.html',
})
export class ProjectDetailMilestonesPageComponent {
  readonly detailService = inject(ProjectDetailService);
}
