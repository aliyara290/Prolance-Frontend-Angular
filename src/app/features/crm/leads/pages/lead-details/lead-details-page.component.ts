import { Component, inject, signal, OnInit } from '@angular/core';
import { ErrorMessageComponent } from '../../../../../shared/ui/error-message/error-message.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LeadsService } from '../../services/leads.service';
import { Lead, LeadStatus, Priority, Source } from '../../types/lead.model';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { DetailsSkeletonComponent } from '../../../../../shared/ui/skeletons/details-skeleton/details-skeleton.component';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { ConfirmModalService } from '../../../../../shared/ui/confirm-modal/confirm-modal.service';
import { UserApiService } from '../../../../../core/auth/services/user-api.service';
import { AuthUser } from '../../../../../core/auth/models/auth-user.model';

@Component({
  selector: 'app-lead-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, DetailsSkeletonComponent, DropdownMenuComponent, ErrorMessageComponent],
  templateUrl: './lead-details-page.component.html',
})
export class LeadDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly leadsService = inject(LeadsService);
  private readonly confirmService = inject(ConfirmModalService);
  private readonly userApiService = inject(UserApiService);

  readonly lead = signal<any | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<'overview' | 'timeline'>('overview');
  readonly userCache = signal<Record<string, AuthUser>>({});

  protected readonly ArrowLeft = ArrowLeft;

  // ─── Helpers ─────────────────────────────────────────────

  getLeadDisplayName(): string {
    const l = this.lead();
    if (!l) return '';
    if (l.contact) return `${l.contact.firstName} ${l.contact.lastName}`;
    return l.title || '';
  }

  getInitials(): string {
    const name = this.getLeadDisplayName();
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.map((p: string) => p.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(): string {
    const l = this.lead();
    if (!l) return '#6366f1';
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];
    const str = l.id || '';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getOwnerInitials(): string {
    const name = this.getUserName(this.lead()?.assignedTo || this.lead()?.createdBy, 'U');
    const parts = name.trim().split(/\s+/);
    return parts.map((p: string) => p.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  getStatusConfig(status: LeadStatus): { label: string; classes: string } {
    const configs: Record<LeadStatus, { label: string; classes: string }> = {
      NEW: { label: 'New', classes: 'bg-[var(--color-info-soft)] text-[var(--color-info)] border-[var(--color-info)]/20' },
      CONTACTED: { label: 'Contacted', classes: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/20' },
      QUALIFIED: { label: 'Qualified', classes: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success)]/20' },
      UNQUALIFIED: { label: 'Unqualified', classes: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger)]/20' },
    };
    return configs[status] || { label: status, classes: 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]' };
  }

  getPriorityConfig(priority: Priority): { label: string; dotColor: string } {
    const configs: Record<Priority, { label: string; dotColor: string }> = {
      HIGH: { label: 'High', dotColor: 'bg-[var(--color-danger)]' },
      MEDIUM: { label: 'Medium', dotColor: 'bg-[var(--color-warning)]' },
      LOW: { label: 'Low', dotColor: 'bg-[var(--color-success)]' },
    };
    return configs[priority] || { label: priority, dotColor: 'bg-[var(--color-text-muted)]' };
  }

  formatSource(source: Source): string {
    const map: Record<Source, string> = {
      WEBSITE: 'Website',
      REFERRAL: 'Referral',
      SOCIAL_MEDIA: 'Social Media',
      COLD_CALL: 'Cold Call',
      EVENT: 'Event',
      OTHER: 'Other',
    };
    return map[source] || source;
  }

  getEmail(): string | null {
    const l = this.lead();
    return l?.email || l?.contact?.email || null;
  }

  getPhone(): string | null {
    const l = this.lead();
    return l?.phone || l?.contact?.phone || null;
  }

  getCompany(): string | null {
    const l = this.lead();
    return l?.company || l?.client?.name || null;
  }

  getWebsite(): string | null {
    const l = this.lead();
    return l?.website || l?.client?.website || null;
  }

  hasAddress(): boolean {
    const l = this.lead();
    return !!(l?.address?.street || l?.client?.address?.street || l?.address?.city || l?.client?.address?.city);
  }

  getAddressField(field: string): string {
    const l = this.lead();
    return l?.address?.[field] || l?.client?.address?.[field] || '';
  }

  getFullAddress(): string {
    const parts = ['street', 'city', 'state', 'zipCode', 'country']
      .map(f => this.getAddressField(f))
      .filter(v => !!v);
    return parts.join(', ');
  }

  // ─── Lifecycle ───────────────────────────────────────────

  ngOnInit(): void {
    this.loadLead();
  }

  getUserName(userId: string | null | undefined, fallback: string = '-'): string {
    if (!userId) return fallback;
    const user = this.userCache()[userId];
    return user ? `${user.firstName} ${user.lastName}` : userId;
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

  loadLead(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No Lead ID provided in route.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.leadsService.getLead(id).subscribe({
      next: (res) => {
        this.lead.set(res.data);
        if (res.data.createdBy) this.loadUserDetails(res.data.createdBy);
        if (res.data.assignedTo) this.loadUserDetails(res.data.assignedTo);
        if (res.data.updatedBy) this.loadUserDetails(res.data.updatedBy);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load lead details', err);
        this.error.set('Lead not found or failed to load lead details.');
        this.loading.set(false);
      }
    });
  }

  // ─── Actions ─────────────────────────────────────────────

  onEdit(): void {
    const currentLead = this.lead();
    if (currentLead) {
      this.router.navigate(['/app/crm/leads', currentLead.id, 'edit']);
    }
  }

  async onDelete(): Promise<void> {
    const currentLead = this.lead();
    if (!currentLead) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Delete Lead',
      message: `Are you sure you want to delete lead "${currentLead.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });

    if (confirmed) {
      this.leadsService.deleteLead(currentLead.id).subscribe({
        next: () => {
          this.router.navigate(['/app/crm/leads']);
        },
        error: (err) => {
          console.error('Failed to delete lead', err);
          alert('Failed to delete lead.');
        }
      });
    }
  }

  async onConvert(): Promise<void> {
    const currentLead = this.lead();
    if (!currentLead) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Convert to Deal',
      message: `Are you sure you want to convert lead "${currentLead.title}" to a deal?`,
      confirmText: 'Convert',
      cancelText: 'Cancel',
      danger: false
    });

    if (confirmed) {
      this.leadsService.convertToDeal(currentLead.id).subscribe({
        next: () => {
          alert('Lead converted to deal successfully!');
          this.loadLead();
        },
        error: (err) => {
          console.error('Failed to convert lead', err);
          alert('Failed to convert lead.');
        }
      });
    }
  }

  getSeverity(status: LeadStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<LeadStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      NEW: 'info',
      CONTACTED: 'warn',
      QUALIFIED: 'success',
      UNQUALIFIED: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  getPrioritySeverity(priority: Priority): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<Priority, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      HIGH: 'danger',
      MEDIUM: 'warn',
      LOW: 'info',
    };
    return map[priority] ?? 'secondary';
  }

  readonly moreActions: DropdownMenuItem[] = [
    {
      label: 'Edit Lead', value: 'edit',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>'
    },
    {
      label: 'Convert to Deal', value: 'convert',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>'
    },
    {
      label: 'Email Lead', value: 'email',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'
    },
    {
      label: 'Delete Lead', value: 'delete', danger: true, dividerBefore: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>'
    },
  ];

  onMoreAction(item: DropdownMenuItem): void {
    if (item.value === 'edit') {
      this.onEdit();
    } else if (item.value === 'delete') {
      this.onDelete();
    } else if (item.value === 'convert') {
      this.onConvert();
    } else if (item.value === 'email') {
      const email = this.getEmail();
      if (email) {
        window.location.href = `mailto:${email}`;
      }
    }
  }
}
