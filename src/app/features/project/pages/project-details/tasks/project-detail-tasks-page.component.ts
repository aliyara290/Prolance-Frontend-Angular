import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDetailService } from '../../../services/project-detail.service';

@Component({
  selector: 'app-project-detail-tasks-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-detail-tasks-page.component.html',
})
export class ProjectDetailTasksPageComponent {
  readonly detailService = inject(ProjectDetailService);
}
