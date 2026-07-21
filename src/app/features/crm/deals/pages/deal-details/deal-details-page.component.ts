import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DealsService } from '../../services/deals.service';
import { Deal, Stage, Priority, Source } from '../../types/deal.model';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { DetailsSkeletonComponent } from '../../../../../shared/ui/skeletons/details-skeleton/details-skeleton.component';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../../shared/ui/dropdown-menu/dropdown-menu.component';
import { ErrorMessageComponent } from '../../../../../shared/ui/error-message/error-message.component';
import { ConfirmModalService } from '../../../../../shared/ui/confirm-modal/confirm-modal.service';
import { UserApiService } from '../../../../../core/auth/services/user-api.service';
import { AuthUser } from '../../../../../core/auth/models/auth-user.model';

@Component({
  selector: 'app-deal-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, DetailsSkeletonComponent, DropdownMenuComponent, ErrorMessageComponent],
  templateUrl: './deal-details-page.component.html',
})
export class DealDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dealsService = inject(DealsService);
  private readonly confirmService = inject(ConfirmModalService);
  private readonly userApiService = inject(UserApiService);

  readonly deal = signal<Deal | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<'overview' | 'timeline'>('overview');
  readonly userCache = signal<Record<string, AuthUser>>({});

  protected readonly ArrowLeft = ArrowLeft;

  // ─── Helpers ─────────────────────────────────────────────

  getInitials(): string {
    const title = this.deal()?.title;
    if (!title) return '?';
    const parts = title.trim().split(/\s+/);
    return parts.map((p: string) => p.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(): string {
    const d = this.deal();
    if (!d) return '#10b981';
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];
    const str = d.id || '';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getStageConfig(stage: Stage): { label: string; classes: string } {
    const configs: Record<Stage, { label: string; classes: string }> = {
      PROSPECTING: { label: 'Prospecting', classes: 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]' },
      QUALIFICATION: { label: 'Qualification', classes: 'bg-[var(--color-info-soft)] text-[var(--color-info)] border-[var(--color-info)]/20' },
      PROPOSAL: { label: 'Proposal', classes: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/20' },
      NEGOTIATION: { label: 'Negotiation', classes: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/20' },
      WON: { label: 'Won', classes: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success)]/20' },
      LOST: { label: 'Lost', classes: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger)]/20' },
    };
    return configs[stage] || { label: stage, classes: 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]' };
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

  // ─── Lifecycle ───────────────────────────────────────────

  ngOnInit(): void {
    this.loadDeal();
  }

  getUserName(userId: string | null | undefined, fallback: string = '-'): string {
    if (!userId) return fallback;
    const user = this.userCache()[userId];
    return user ? `${user.firstName} ${user.lastName}` : userId;
  }

  getOwnerInitials(): string {
    const name = this.getUserName(this.deal()?.createdBy, 'U');
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

  loadDeal(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No Deal ID provided in route.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.dealsService.getDeal(id).subscribe({
      next: (res) => {
        this.deal.set(res.data);
        if (res.data.createdBy) this.loadUserDetails(res.data.createdBy);
        if (res.data.updatedBy) this.loadUserDetails(res.data.updatedBy);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load deal details', err);
        this.error.set('Deal not found or failed to load deal details.');
        this.loading.set(false);
      }
    });
  }

  // ─── Actions ─────────────────────────────────────────────

  onEdit(): void {
    const currentDeal = this.deal();
    if (currentDeal) {
      this.router.navigate(['/app/crm/deals', currentDeal.id, 'edit']);
    }
  }

  async onDelete(): Promise<void> {
    const currentDeal = this.deal();
    if (!currentDeal) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Delete Deal',
      message: `Are you sure you want to delete deal "${currentDeal.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });

    if (confirmed) {
      this.dealsService.deleteDeal(currentDeal.id).subscribe({
        next: () => {
          this.router.navigate(['/app/crm/deals']);
        },
        error: (err) => {
          console.error('Failed to delete deal', err);
          alert('Failed to delete deal.');
        }
      });
    }
  }

  readonly moreActions: DropdownMenuItem[] = [
    {
      label: 'Edit Deal', value: 'edit',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>'
    },
    {
      label: 'Delete Deal', value: 'delete', danger: true, dividerBefore: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>'
    },
  ];

  onMoreAction(item: DropdownMenuItem): void {
    if (item.value === 'edit') {
      this.onEdit();
    } else if (item.value === 'delete') {
      this.onDelete();
    }
  }
}
