import { Component } from '@angular/core';
import {TasksListPageComponent} from '../tasks-list/tasks-list-page.component';

@Component({
  selector: 'app-task-page',
  imports: [
    TasksListPageComponent
  ],
  templateUrl: './task-page.component.html',
})
export class TaskPageComponent {

}
