import { Component } from '@angular/core';
import {TasksListPageComponent} from '../tasks-list/tasks-list-page.component';
import { LucideAngularModule } from 'lucide-angular';
import { List, Kanban, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-task-page',
  imports: [
    TasksListPageComponent,
    LucideAngularModule,
  ],
  templateUrl: './task-page.component.html',
})
export class TaskPageComponent {

  icons = {
      kanban: Kanban,
    }
}
