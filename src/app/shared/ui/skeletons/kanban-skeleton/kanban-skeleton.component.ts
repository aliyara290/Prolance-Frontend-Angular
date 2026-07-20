import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-kanban-skeleton',
  standalone: true,
  templateUrl: './kanban-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanSkeletonComponent {
  columns = Array(5);
  cards = [Array(3), Array(2), Array(4), Array(1), Array(3)];
}
