import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-icon-wrapper',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './icon-wrapper.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class IconWrapperComponent {
  @Input({ required: true }) icon!: LucideIconData;

  @Input() size = 20;

  @Input() strokeWidth = 2;

  @Input() className = '';
}
