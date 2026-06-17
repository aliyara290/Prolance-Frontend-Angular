import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DealsService } from '../../services/deals.service';
import { Deal, Stage, Priority } from '../../types/deal.model';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { DetailsSkeletonComponent } from '../../../../../shared/ui/skeletons/details-skeleton/details-skeleton.component';

@Component({
  selector: 'app-deal-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TagModule, ButtonModule, LucideAngularModule, DetailsSkeletonComponent],
  templateUrl: './deal-details-page.component.html',
})
export class DealDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dealsService = inject(DealsService);

  readonly deal = signal<Deal | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<'overview' | 'timeline'>('overview');

  readonly ArrowLeft = ArrowLeft;

  ngOnInit(): void {
    this.loadDeal();
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
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load deal details', err);
        this.error.set('Deal not found or failed to load deal details.');
        this.loading.set(false);
      }
    });
  }

  onEdit(): void {
    const currentDeal = this.deal();
    if (currentDeal) {
      this.router.navigate(['/app/crm/deals', currentDeal.id, 'edit']);
    }
  }

  onDelete(): void {
    const currentDeal = this.deal();
    if (currentDeal && confirm(`Are you sure you want to delete deal "${currentDeal.title}"?`)) {
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

  getStageSeverity(stage: Stage): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<Stage, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      PROSPECTING: 'secondary',
      QUALIFICATION: 'info',
      PROPOSAL: 'warn',
      NEGOTIATION: 'warn',
      WON: 'success',
      LOST: 'danger',
    };
    return map[stage] ?? 'secondary';
  }

  getPrioritySeverity(priority: Priority): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<Priority, 'success' | 'warn' | 'danger'> = {
      HIGH: 'danger',
      MEDIUM: 'warn',
      LOW: 'success',
    };
    return map[priority] ?? 'secondary';
  }
}
