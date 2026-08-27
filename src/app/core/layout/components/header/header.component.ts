import {Component, ElementRef, HostListener, inject, signal, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {LayoutStateService} from '../../services/layout-state.service';
import {UserMenuComponent} from '../user-menu/user-menu.component';
import {
  LucideAngularModule,
  Calendar,
  Plus,
  Settings,
  Target,
  Handshake,
  Goal,
  ContactRound,
  Bell,
  Building2, MessageCircleMore,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  Users
} from 'lucide-angular';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {WorkspaceSwitcherComponent} from '../workspace-switcher/workspace-switcher.component';
import {NotificationService, NotificationResponse} from '../../../services/notification.service';
import {NotificationWebSocketService, WebSocketMessage} from '../../../services/notification-websocket.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, UserMenuComponent, LucideAngularModule, RouterLink, RouterLinkActive, WorkspaceSwitcherComponent],
  templateUrl: "header.component.html"
})
export class HeaderComponent implements OnInit, OnDestroy {
  layoutState = inject(LayoutStateService);
  private elementRef = inject(ElementRef);
  private router = inject(Router);
  readonly notificationService = inject(NotificationService);
  readonly wsService = inject(NotificationWebSocketService);

  protected readonly visualViewport = visualViewport;

  isQuickActionsOpen = signal(false);
  isNotificationsOpen = signal(false);

  notifications = signal<NotificationResponse[]>([]);
  unreadCount = this.notificationService.unreadCount;
  private pollingSubscription?: Subscription;
  private wsSubscription?: Subscription;

  icons = {
    plus: Plus,
    settings: Settings,
    message: MessageCircleMore,
    project: Target,
    deal: Handshake,
    opportunity: Goal,
    contact: ContactRound,
    client: Building2,
    notification: Bell,
    checkAll: CheckCircle2
  };

  quickActions = [
    {
      label: 'New Lead',
      icon: this.icons.opportunity,
      route: '/app/crm/leads/create',
      color: 'bg-sky-700'
    },
    {
      label: 'New Contact',
      icon: this.icons.contact,
      route: '/app/crm/contacts/create',
      color: 'bg-violet-500'
    },
    {
      label: 'New Client',
      icon: this.icons.client,
      route: '/app/crm/clients/create',
      color: 'bg-pink-500'
    },
    {
      label: 'New Deal',
      icon: this.icons.deal,
      route: '/app/crm/deals/create',
      color: 'bg-amber-500'
    },
    {
      label: 'New Project',
      icon: this.icons.project,
      route: '/app/projects/all/create',
      color: 'bg-emerald-500'
    },
    {
      label: 'New Milestone',
      icon: this.icons.project,
      route: '/app/projects/milestones/create',
      color: 'bg-cyan-500'
    },
    {
      label: 'New Member',
      icon: this.icons.project,
      route: '/app/settings/users',
      color: 'bg-rose-500'
    }
  ];

  ngOnInit() {
    this.notificationService.fetchUnreadCount().subscribe();
    this.fetchNotifications();
    
    // Initialize WebSocket connection
    this.wsService.initConnection();
    
    // Subscribe to real-time notifications
    this.wsSubscription = this.wsService.watchNotifications().subscribe((msg: WebSocketMessage) => {
      // Update unread count based on the push
      this.notificationService.unreadCount.set(msg.unreadCount);
      
      if (msg.type === 'NEW_NOTIFICATION' && msg.notification) {
        // Add to the top of the list if we have it open or just to keep state fresh
        this.notifications.update(current => [msg.notification, ...current]);
        
        // You could also trigger a toast/snackbar here if desired
        console.log('New notification received via WS:', msg.notification);
      } else if (msg.type === 'NOTIFICATION_READ' && msg.notificationId) {
        // Update specific notification status
        this.notifications.update(current => {
          return current.map(n => 
            n.id === msg.notificationId ? { ...n, readStatus: 'READ' } : n
          );
        });
      }
    });

    this.pollingSubscription = interval(50000).subscribe(() => {
      // Keep polling as a fallback, but the websocket handles real-time
      this.notificationService.fetchUnreadCount().subscribe();
      if (this.isNotificationsOpen()) {
        this.fetchNotifications();
      }
    });
  }

  ngOnDestroy() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }

  fetchNotifications() {
    this.notificationService.getNotifications(0, 20).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.notifications.set(res.data);
        }
      }
    });
  }

  toggleQuickActions(event: Event): void {
    event.stopPropagation();
    this.isQuickActionsOpen.update(v => !v);
    this.isNotificationsOpen.set(false);
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.isNotificationsOpen.update(v => !v);
    this.isQuickActionsOpen.set(false);

    if (this.isNotificationsOpen()) {
      this.fetchNotifications();
    }
  }

  markAsRead(notification: NotificationResponse, event: Event) {
    event.stopPropagation();
    if (notification.readStatus === 'UNREAD') {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.readStatus = 'READ';
        this.notifications.set([...this.notifications()]);
      });
    }
  }

  markAllAsRead(event: Event) {
    event.stopPropagation();
    this.notificationService.markAllAsRead().subscribe(() => {
      const current = this.notifications();
      current.forEach(n => n.readStatus = 'READ');
      this.notifications.set([...current]);
    });
  }

  navigateQuickAction(route: string): void {
    this.isQuickActionsOpen.set(false);
    this.router.navigate([route]);
  }

  navigateNotification(notification: NotificationResponse): void {
    if (notification.readStatus === 'UNREAD') {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.readStatus = 'READ';
        this.notifications.set([...this.notifications()]);
      });
    }

    if (notification.actionUrl) {
      this.isNotificationsOpen.set(false);

      if (notification.type === 'TASK_ASSIGNED') {
        const match = notification.actionUrl.match(/\/projects\/(?:all\/)?([^/?]+)/);
        if (match) {
          const projectId = match[1];
          const taskId = notification.entityId;

          if (projectId && taskId) {
            this.router.navigate([`/app/projects/all/${projectId}/tasks`], { queryParams: { taskId } });
            return;
          }
        }
      } else if (notification.type === 'MEMBER_ADDED_TO_PROJECT') {
        if (notification.entityId) {
          this.router.navigate([`/app/projects/all/${notification.entityId}/dashboard`]);
          return;
        }
      }

      this.router.navigateByUrl(notification.actionUrl);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isQuickActionsOpen.set(false);
      this.isNotificationsOpen.set(false);
    }
  }

  getNotificationIcon(type: string): any {
    switch (type) {
      case 'TASK_ASSIGNED': return ClipboardList;
      case 'COMMENT_ADDED': return MessageSquare;
      case 'MEMBER_ADDED_TO_PROJECT': return Users;
      default: return Bell;
    }
  }

  getNotificationPriorityColor(priority: string, element: 'bg' | 'dot' | 'iconBg' | 'iconText'): string {
    const p = (priority || 'LOW').toUpperCase();
    if (p === 'HIGH' || p === 'URGENT' || p === 'CRITICAL') {
      if (element === 'bg') return 'bg-red-500/5';
      if (element === 'dot') return 'bg-red-500';
      if (element === 'iconBg') return 'bg-red-500/10';
      return 'text-red-500';
    } else if (p === 'MEDIUM' || p === 'NORMAL') {
      if (element === 'bg') return 'bg-amber-500/5';
      if (element === 'dot') return 'bg-amber-500';
      if (element === 'iconBg') return 'bg-amber-500/10';
      return 'text-amber-500';
    } else {
      if (element === 'bg') return 'bg-primary/5';
      if (element === 'dot') return 'bg-primary';
      if (element === 'iconBg') return 'bg-primary/10';
      return 'text-primary';
    }
  }
}

