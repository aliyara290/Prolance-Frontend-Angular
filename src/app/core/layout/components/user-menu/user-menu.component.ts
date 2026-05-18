import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../auth/store/auth.selectors';
import { LucideAngularModule } from 'lucide-angular';
import {
  Sun,
  Moon,
  Monitor,
  LogOut,
  User,
  Settings
} from 'lucide-angular';

export type AppMode = 'light' | 'dark' | 'system';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.css'
})
export class UserMenuComponent {
  private readonly store = inject(Store);
  private readonly authService = inject(AuthService);
  private readonly elementRef = inject(ElementRef);

  protected readonly user$ = this.store.select(selectAuthUser);

  protected readonly isOpen = signal(false);

  private getStoredMode(): AppMode {
    const mode = localStorage.getItem('prolance_theme');

    if (mode === 'dark' || mode === 'light' || mode === 'system') {
      return mode;
    }

    return 'light';
  }

  protected readonly currentMode = signal<AppMode>(this.getStoredMode());
  constructor() {
    this.setMode(this.currentMode());
  }
  protected readonly icons = {
    sun: Sun,
    moon: Moon,
    monitor: Monitor,
    logOut: LogOut,
    user: User,
    settings: Settings
  };

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleMenu() {
    this.isOpen.update(v => !v);
  }

  setMode(mode: AppMode): void {
    this.currentMode.set(mode);

    const isDark =
      mode === 'dark' ||
      (mode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('dark', isDark);

    localStorage.setItem('prolance_theme', mode);
  }

  logout() {
    this.authService.logout();
  }
}
