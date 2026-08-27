import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmModalService {
  isOpen = signal(false);
  options = signal<ConfirmOptions | null>(null);

  private responseSubject = new Subject<boolean>();

  confirm(options: ConfirmOptions): Promise<boolean> {
    this.options.set(options);
    this.isOpen.set(true);

    return new Promise(resolve => {
      const sub = this.responseSubject.subscribe(res => {
        resolve(res);
        sub.unsubscribe();
      });
    });
  }

  close(result: boolean) {
    this.isOpen.set(false);
    this.responseSubject.next(result);
  }
}
