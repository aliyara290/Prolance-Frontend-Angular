import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ContactsService } from '../../services/contacts.service';
import { Contact, InfluenceLevel } from '../../types/contact.model';
import { ClientsService } from '../../../clients/services/clients.service';
import { Client } from '../../../clients/types/client.model';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { DetailsSkeletonComponent } from '../../../../../shared/ui/skeletons/details-skeleton/details-skeleton.component';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { ErrorMessageComponent } from '../../../../../shared/ui/error-message/error-message.component';
import { ConfirmModalService } from '../../../../../shared/ui/confirm-modal/confirm-modal.service';
import { UserApiService } from '../../../../../core/auth/services/user-api.service';
import { AuthUser } from '../../../../../core/auth/models/auth-user.model';

@Component({
  selector: 'app-contact-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, DetailsSkeletonComponent, DropdownMenuComponent, ErrorMessageComponent],
  templateUrl: './contact-details-page.component.html',
})
export class ContactDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contactsService = inject(ContactsService);
  private readonly confirmService = inject(ConfirmModalService);
  private readonly userApiService = inject(UserApiService);
  private readonly clientsService = inject(ClientsService);

  readonly contact = signal<Contact | null>(null);
  readonly client = signal<Client | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<'overview' | 'timeline'>('overview');
  readonly userCache = signal<Record<string, AuthUser>>({});

  protected readonly ArrowLeft = ArrowLeft;

  // ─── Helpers ─────────────────────────────────────────────

  getFullName(): string {
    const c = this.contact();
    return c ? `${c.firstName} ${c.lastName}` : '';
  }

  getInitials(): string {
    const c = this.contact();
    if (!c) return '';
    const f = c.firstName?.charAt(0) || '';
    const l = c.lastName?.charAt(0) || '';
    return (f + l).toUpperCase() || '?';
  }

  getAvatarColor(): string {
    const c = this.contact();
    if (!c) return '#000';
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
    const idStr = c.id || '';
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
      hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  getInfluenceConfig(level: InfluenceLevel): { label: string; dotColor: string } {
    const configs: Record<InfluenceLevel, { label: string; dotColor: string }> = {
      HIGH: { label: 'High', dotColor: 'bg-[var(--color-danger)]' },
      MEDIUM: { label: 'Medium', dotColor: 'bg-[var(--color-warning)]' },
      LOW: { label: 'Low', dotColor: 'bg-[var(--color-success)]' },
    };
    return configs[level] || { label: level, dotColor: 'bg-[var(--color-text-muted)]' };
  }

  // ─── Lifecycle ───────────────────────────────────────────

  ngOnInit(): void {
    this.loadContact();
  }

  getUserName(userId: string | null | undefined, fallback: string = '-'): string {
    if (!userId) return fallback;
    const user = this.userCache()[userId];
    return user ? `${user.firstName} ${user.lastName}` : userId;
  }

  getOwnerInitials(): string {
    const name = this.getUserName(this.contact()?.createdBy, 'U');
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

  loadContact(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No Contact ID provided in route.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.contactsService.getContact(id).subscribe({
      next: (res) => {
        this.contact.set(res.data);
        if (res.data.createdBy) this.loadUserDetails(res.data.createdBy);
        if (res.data.updatedBy) this.loadUserDetails(res.data.updatedBy);
        
        if (res.data.clientId) {
          this.clientsService.getClient(res.data.clientId).subscribe({
            next: (clientRes) => this.client.set(clientRes.data),
            error: (err) => console.error('Failed to load client details', err)
          });
        }
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load contact details', err);
        this.error.set('Contact not found or failed to load contact details.');
        this.loading.set(false);
      }
    });
  }

  // ─── Actions ─────────────────────────────────────────────

  onEdit(): void {
    const currentContact = this.contact();
    if (currentContact) {
      this.router.navigate(['/app/crm/contacts', currentContact.id, 'edit']);
    }
  }

  async onDelete(): Promise<void> {
    const currentContact = this.contact();
    if (!currentContact) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Delete Contact',
      message: `Are you sure you want to delete contact "${currentContact.firstName} ${currentContact.lastName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });

    if (confirmed) {
      this.contactsService.deleteContact(currentContact.id).subscribe({
        next: () => {
          this.router.navigate(['/app/crm/contacts']);
        },
        error: (err) => {
          console.error('Failed to delete contact', err);
          alert('Failed to delete contact.');
        }
      });
    }
  }

  readonly moreActions: DropdownMenuItem[] = [
    {
      label: 'Edit Contact', value: 'edit',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>'
    },
    {
      label: 'Email Contact', value: 'email',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'
    },
    {
      label: 'Delete Contact', value: 'delete', danger: true, dividerBefore: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>'
    },
  ];

  onMoreAction(item: DropdownMenuItem): void {
    if (item.value === 'edit') {
      this.onEdit();
    } else if (item.value === 'delete') {
      this.onDelete();
    } else if (item.value === 'email') {
      const email = this.contact()?.email;
      if (email) {
        window.location.href = `mailto:${email}`;
      }
    }
  }
}
