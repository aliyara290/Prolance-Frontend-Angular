import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details-skeleton.component.html',
  styles: [`
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--color-bg-muted) 25%,
        var(--color-bg-inverse) 50%,
        var(--color-bg-muted) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class DetailsSkeletonComponent {
  // Simple helper arrays for repeating skeleton lines
  lines3 = [1, 2, 3];
  lines4 = [1, 2, 3, 4];
  lines5 = [1, 2, 3, 4, 5];
}
