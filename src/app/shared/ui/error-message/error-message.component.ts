import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './error-message.component.html',
  host: {
    'class': 'block w-full h-full'
  }
})
export class ErrorMessageComponent {
  @Input() title: string = 'Oops! Something went wrong';
  @Input() message: string = 'We encountered an unexpected error while loading the data. Please try again.';
  @Input() layout: 'full' | 'inline' = 'full';
  @Input() showRetry: boolean = false;
  
  @Output() retry = new EventEmitter<void>();

  icons = {
    alertTriangle: AlertTriangle,
    refreshCw: RefreshCw
  };

  onRetry(): void {
    this.retry.emit();
  }
}
