import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { DealsService } from '../../services/deals.service';
import { ClientsService } from '../../../clients/services/clients.service';
import { Stage, Priority, OpportunityType, Source } from '../../types/deal.model';
import { Client } from '../../../clients/types/client.model';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-deal-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './deal-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dealsService = inject(DealsService);
  private readonly clientsService = inject(ClientsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isEditMode = signal(false);
  readonly currentDealId = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly clients = signal<Client[]>([]);

  readonly stageOptions: Stage[] = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
  readonly priorityOptions: Priority[] = ['HIGH', 'MEDIUM', 'LOW'];
  readonly typeOptions: OpportunityType[] = ['NEW_BUSINESS', 'EXISTING_BUSINESS'];
  readonly sourceOptions: Source[] = ['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'COLD_CALL', 'EVENT', 'OTHER'];

  readonly ArrowLeft = ArrowLeft;

  dealForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.checkEditMode();
  }

  private initForm(): void {
    this.dealForm = this.fb.group({
      clientId: ['', [Validators.required]],
      title: ['', [Validators.required]],
      description: [''],
      estimatedBudget: [null],
      expectedRevenue: [null],
      probability: [null, [Validators.min(0), Validators.max(100)]],
      stage: ['PROSPECTING', [Validators.required]],
      expectedStartDate: [''],
      expectedEndDate: [''],
      priority: ['MEDIUM', [Validators.required]],
      type: ['NEW_BUSINESS'],
      source: ['COLD_CALL', [Validators.required]],
      // Edit only fields:
      lastActivityAt: [''],
      nextFollowUpAt: [''],
      closingDate: [''],
      lostReason: [''],
    });
  }

  private loadClients(): void {
    this.clientsService.getClients().subscribe({
      next: (res) => this.clients.set(res.data || []),
      error: (err) => console.error('Failed to load clients', err)
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.currentDealId.set(id);
      this.loadDealDetails(id);
    }
  }

  private loadDealDetails(id: string): void {
    this.dealsService.getDeal(id).subscribe({
      next: (res) => {
        const deal = res.data;
        if (deal) {
          this.dealForm.patchValue({
            clientId: deal.clientId,
            title: deal.title,
            description: deal.description || '',
            estimatedBudget: deal.estimatedBudget,
            expectedRevenue: deal.expectedRevenue,
            probability: deal.probability,
            stage: deal.stage,
            expectedStartDate: deal.expectedStartDate || '',
            expectedEndDate: deal.expectedEndDate || '',
            priority: deal.priority,
            type: deal.type,
            source: deal.source,
            lastActivityAt: deal.lastActivityAt || '',
            nextFollowUpAt: deal.nextFollowUpAt || '',
            closingDate: deal.closingDate || '',
            lostReason: deal.lostReason || '',
          });
        }
      },
      error: (err) => console.error('Failed to load deal', err)
    });
  }

  cancel(): void {
    if (this.isEditMode() && this.currentDealId()) {
      this.router.navigate(['/app/crm/deals', this.currentDealId()]);
    } else {
      this.router.navigate(['/app/crm/deals']);
    }
  }

  submit(): void {
    if (this.dealForm.invalid) {
      this.dealForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const rawValue = this.dealForm.value;

    const payload: any = {
      clientId: rawValue.clientId,
      title: rawValue.title,
      description: rawValue.description || undefined,
      estimatedBudget: rawValue.estimatedBudget,
      expectedRevenue: rawValue.expectedRevenue,
      probability: rawValue.probability,
      stage: rawValue.stage,
      expectedStartDate: rawValue.expectedStartDate || undefined,
      expectedEndDate: rawValue.expectedEndDate || undefined,
      priority: rawValue.priority,
      type: rawValue.type || undefined,
      source: rawValue.source,
    };

    if (this.isEditMode()) {
      payload.lastActivityAt = rawValue.lastActivityAt || undefined;
      payload.nextFollowUpAt = rawValue.nextFollowUpAt || undefined;
      payload.closingDate = rawValue.closingDate || undefined;
      payload.lostReason = rawValue.lostReason || undefined;
    }

    if (!this.isEditMode()) {
      this.dealsService.createDeal(payload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(['/app/crm/deals']);
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Failed to create deal', err);
        }
      });
    } else {
      const dealId = this.currentDealId();
      if (dealId) {
        this.dealsService.updateDeal(dealId, payload).subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/app/crm/deals', dealId]);
          },
          error: (err) => {
            this.submitting.set(false);
            console.error('Failed to update deal', err);
          }
        });
      }
    }
  }
}
