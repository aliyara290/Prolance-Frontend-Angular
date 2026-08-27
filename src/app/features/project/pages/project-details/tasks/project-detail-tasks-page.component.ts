import { Component, inject } from '@angular/core';
import { ProjectDetailService } from '../../../services/project-detail.service';
import { TasksListPageComponent } from '../../../../task/pages/tasks-list/tasks-list-page.component';

@Component({
  selector: 'app-project-detail-tasks-page',
  standalone: true,
  imports: [TasksListPageComponent],
  templateUrl: './project-detail-tasks-page.component.html',
})
export class ProjectDetailTasksPageComponent {
  readonly detailService = inject(ProjectDetailService);
}
