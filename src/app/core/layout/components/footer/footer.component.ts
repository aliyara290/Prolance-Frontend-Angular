import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex justify-end w-full border-t border-[var(--color-border-strong)] bg-[var(--color-bg)] text-[var(--color-text-muted)] text-xs h-[30px] flex items-center px-[var(--spacing-md)] justify-between shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.10)]'
  }
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  appVersion = 'v1.0.0-beta';
}
