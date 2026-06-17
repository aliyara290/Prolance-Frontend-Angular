import { Component } from '@angular/core';

@Component({
  selector: 'app-entity-list-skeleton',
  imports: [],
  templateUrl: './entity-list-skeleton.component.html',
  styleUrls: ['./entity-list-skeleton.component.css'],
})
export class EntityListSkeletonComponent {
  rows = Array(9);
}
