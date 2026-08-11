import { Component, inject, signal } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-loading-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="fixed top-0 left-0 w-full h-1.5 z-[999999839893] bg-transparent pointer-events-none">
        <div class="h-full bg-gradient-to-r from-[#5B92E5] via-[#F68F55] to-[#5B92E5] transition-all duration-300 ease-out"
             [style.width.%]="progress()"></div>
      </div>
    }
  `
})
export class TopLoadingBarComponent {
  progress = signal(0);
  visible = signal(false);
  private router = inject(Router);
  private intervalId: any;
  private hideTimeout: any;
  private resetTimeout: any;

  constructor() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.start();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.complete();
      }
    });
  }

  start() {
    clearTimeout(this.hideTimeout);
    clearTimeout(this.resetTimeout);
    clearInterval(this.intervalId);
    
    this.visible.set(true);
    this.progress.set(0);
    
    // Simulate realistic loading progress
    this.intervalId = setInterval(() => {
      let p = this.progress();
      // Slow down the progress as it gets closer to 100
      let increment = (100 - p) * 0.1;
      // Ensure a minimum increment
      if (increment < 0.5) increment = 0.5;
      
      p += increment;
      
      // Cap at 95% until complete
      if (p >= 95) {
        p = 95;
        clearInterval(this.intervalId);
      }
      this.progress.set(p);
    }, 150);
  }

  complete() {
    clearInterval(this.intervalId);
    this.progress.set(100);
    
    // Give it a moment to show 100% before hiding
    this.hideTimeout = setTimeout(() => {
      this.visible.set(false);
      // Reset after fade out
      this.resetTimeout = setTimeout(() => this.progress.set(0), 300);
    }, 300);
  }
}
