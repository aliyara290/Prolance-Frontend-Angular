import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  severity: ToastSeverity;
  summary: string;
  detail?: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  private nextId = 0;

  success(summary: string, detail?: string, duration: number = 4000): void {
    this.add('success', summary, detail, duration);
  }

  error(summary: string, detail?: string, duration: number = 6000): void {
    this.add('error', summary, detail, duration);
  }

  warning(summary: string, detail?: string, duration: number = 5000): void {
    this.add('warning', summary, detail, duration);
  }

  info(summary: string, detail?: string, duration: number = 4000): void {
    this.add('info', summary, detail, duration);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private add(severity: ToastSeverity, summary: string, detail?: string, duration: number = 4000): void {
    const id = this.nextId++;
    const toast: Toast = { id, severity, summary, detail, duration };
    this.toasts.update(list => [...list, toast]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }
}
