import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClientsService } from '../../services/clients.service';
import { Client, ClientStatus } from '../../types/client.model';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { DetailsSkeletonComponent } from '../../../../../shared/ui/skeletons/details-skeleton/details-skeleton.component';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { ErrorMessageComponent } from '../../../../../shared/ui/error-message/error-message.component';
import { ConfirmModalService } from '../../../../../shared/ui/confirm-modal/confirm-modal.service';
import { UserApiService } from '../../../../../core/auth/services/user-api.service';
import { AuthUser } from '../../../../../core/auth/models/auth-user.model';
import { AttachmentsComponent } from '../../../../../shared/ui/attachments/attachments.component';

@Component({
  selector: 'app-client-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, DetailsSkeletonComponent, DropdownMenuComponent, ErrorMessageComponent, AttachmentsComponent],
  templateUrl: './client-details-page.component.html',
})
export class ClientDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientsService = inject(ClientsService);
  private readonly confirmService = inject(ConfirmModalService);
  private readonly userApiService = inject(UserApiService);

  readonly client = signal<Client | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<'overview' | 'timeline' | 'attachments'>('overview');
  readonly userCache = signal<Record<string, AuthUser>>({});

  protected readonly ArrowLeft = ArrowLeft;


  getInitials(): string {
    const name = this.client()?.name;
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.map((p: string) => p.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(): string {
    const c = this.client();
    if (!c) return '#3b82f6';
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];
    const str = c.id || '';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getStatusConfig(status: ClientStatus): { label: string; classes: string } {
    const configs: Record<ClientStatus, { label: string; classes: string }> = {
      ACTIVE: { label: 'Active', classes: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success)]/20' },
      INACTIVE: { label: 'Inactive', classes: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/20' },
      ARCHIVED: { label: 'Archived', classes: 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]' },
    };
    return configs[status] || { label: status, classes: 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]' };
  }

  // ─── Lifecycle ───────────────────────────────────────────

  ngOnInit(): void {
    this.loadClient();
  }

  getUserName(userId: string | null | undefined, fallback: string = '-'): string {
    if (!userId) return fallback;
    const user = this.userCache()[userId];
    return user ? `${user.firstName} ${user.lastName}` : userId;
  }

  getOwnerInitials(): string {
    const name = this.getUserName(this.client()?.createdBy, 'U');
    const parts = name.trim().split(/\s+/);
    return parts.map((p: string) => p.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  private loadUserDetails(userId: string): void {
    if (!userId || this.userCache()[userId]) return;
    this.userApiService.getByKeycloakUserId(userId).subscribe({
      next: (res) => {
        this.userCache.update(cache => ({ ...cache, [userId]: res.data }));
      },
      error: (err) => console.error(`Failed to load user ${userId}`, err)
    });
  }

  loadClient(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No Client ID provided in route.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.clientsService.getClient(id).subscribe({
      next: (res) => {
        this.client.set(res.data);
        if (res.data.createdBy) this.loadUserDetails(res.data.createdBy);
        if (res.data.updatedBy) this.loadUserDetails(res.data.updatedBy);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load client details', err);
        this.error.set('Client not found or failed to load client details.');
        this.loading.set(false);
      }
    });
  }

  // ─── Actions ─────────────────────────────────────────────

  onEdit(): void {
    const currentClient = this.client();
    if (currentClient) {
      this.router.navigate(['/app/crm/clients', currentClient.id, 'edit']);
    }
  }

  async onDelete(): Promise<void> {
    const currentClient = this.client();
    if (!currentClient) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Delete Client',
      message: `Are you sure you want to delete client "${currentClient.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });

    if (confirmed) {
      this.clientsService.deleteClient(currentClient.id).subscribe({
        next: () => {
          this.router.navigate(['/app/crm/clients']);
        },
        error: (err) => {
          console.error('Failed to delete client', err);
          alert('Failed to delete client.');
        }
      });
    }
  }

  readonly moreActions: DropdownMenuItem[] = [
    {
      label: 'Edit Client', value: 'edit',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>'
    },
    {
      label: 'Visit Website', value: 'website',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>'
    },
    {
      label: 'Delete Client', value: 'delete', danger: true, dividerBefore: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>'
    },
  ];

  onMoreAction(item: DropdownMenuItem): void {
    if (item.value === 'edit') {
      this.onEdit();
    } else if (item.value === 'delete') {
      this.onDelete();
    } else if (item.value === 'website') {
      const website = this.client()?.website;
      if (website) {
        window.open(website.startsWith('http') ? website : `https://${website}`, '_blank');
      }
    }
  }
}
