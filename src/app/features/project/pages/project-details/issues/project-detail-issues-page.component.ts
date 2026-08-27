import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDetailService } from '../../../services/project-detail.service';

@Component({
  selector: 'app-project-detail-issues-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-detail-issues-page.component.html',
})
export class ProjectDetailIssuesPageComponent {
  readonly detailService = inject(ProjectDetailService);
}
