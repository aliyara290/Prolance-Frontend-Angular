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
  metaCells = [
    { labelWidth: '100px', valueWidth: '70px' },
    { labelWidth: '60px',  valueWidth: '80px' },
    { labelWidth: '50px',  valueWidth: '120px' },
    { labelWidth: '55px',  valueWidth: '56px' },
  ];

  clientRowsLeft = [
    { label: '100px', value: '80px' },
    { label: '60px',  value: '90px' },
    { label: '40px',  value: '90px' },
    { label: '55px',  value: '85px' },
    { label: '75px',  value: '70px' },
  ];

  clientRowsRight = [
    { label: '50px',  value: '110px' },
    { label: '30px',  value: '90px' },
    { label: '60px',  value: '140px' },
  ];
}
