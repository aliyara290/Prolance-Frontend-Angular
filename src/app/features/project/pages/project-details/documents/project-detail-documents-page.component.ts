import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDetailService } from '../../../services/project-detail.service';

@Component({
  selector: 'app-project-detail-documents-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-detail-documents-page.component.html',
})
export class ProjectDetailDocumentsPageComponent {
  readonly detailService = inject(ProjectDetailService);
}
