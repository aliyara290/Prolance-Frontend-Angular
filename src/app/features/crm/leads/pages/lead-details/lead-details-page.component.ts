import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LeadsService } from '../../services/leads.service';
import { Lead, LeadStatus, Priority } from '../../types/lead.model';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { LeadModalComponent } from '../../components/lead-modal/lead-modal.component';
import {ArrowLeft, LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-lead-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TagModule, ButtonModule, LeadModalComponent, LucideAngularModule],
  templateUrl: './lead-details-page.component.html',
})
export class LeadDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly leadsService = inject(LeadsService);

  @ViewChild('leadModal') leadModal!: LeadModalComponent;

  readonly lead = signal<any | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<'overview' | 'timeline'>('overview');

  ngOnInit(): void {
    this.loadLead();
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
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load lead details', err);
        this.error.set('Lead not found or failed to load lead details.');
        this.loading.set(false);
      }
    });
  }


  onEdit(): void {
    const currentLead = this.lead();
    if (currentLead) {
      this.leadModal.openEdit(currentLead);
    }
  }

  onModalSaved(): void {
    this.loadLead();
  }

  onDelete(): void {
    const currentLead = this.lead();
    if (currentLead && confirm(`Are you sure you want to delete lead "${currentLead.title}"?`)) {
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

  onConvert(): void {
    const currentLead = this.lead();
    if (currentLead && confirm(`Are you sure you want to convert lead "${currentLead.title}" to a deal?`)) {
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

  protected readonly ArrowLeft = ArrowLeft;
}
