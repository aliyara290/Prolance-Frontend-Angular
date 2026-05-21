import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ClientsService } from '../../services/clients.service';
import { ClientType, ClientSource, Ownership } from '../../types/client.model';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-client-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './client-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clientsService = inject(ClientsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isEditMode = signal(false);
  readonly currentClientId = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly typeOptions: ClientType[] = ['B2B', 'B2C', 'ENTERPRISE', 'STARTUP'];
  readonly sourceOptions: ClientSource[] = ['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'COLD_CALL', 'EVENT', 'OTHER'];
  readonly ownershipOptions: Ownership[] = ['PRIVATE', 'PUBLIC', 'GOVERNMENT', 'PARTNERSHIP', 'OTHER'];

  readonly ArrowLeft = ArrowLeft;

  clientForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required]],
      industry: [''],
      website: [''],
      phone: [''],
      fax: [''],
      type: ['ENTERPRISE', [Validators.required]],
      source: ['COLD_CALL', [Validators.required]],
      ownership: ['PRIVATE'],
      annualRevenue: [null],
      sicCode: [''],
      description: [''],
      address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
      }),
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.currentClientId.set(id);
      this.loadClientDetails(id);
    }
  }

  private loadClientDetails(id: string): void {
    this.clientsService.getClient(id).subscribe({
      next: (res) => {
        const client = res.data;
        if (client) {
          this.clientForm.patchValue({
            name: client.name,
            industry: client.industry,
            website: client.website,
            phone: client.phone,
            fax: client.fax,
            type: client.type,
            source: client.source,
            ownership: client.ownership,
            annualRevenue: client.annualRevenue,
            sicCode: client.sicCode || '',
            description: client.description || '',
            address: client.address || { street: '', city: '', state: '', country: '', zipCode: '' },
          });
        }
      },
      error: (err) => console.error('Failed to load client', err)
    });
  }

  cancel(): void {
    if (this.isEditMode() && this.currentClientId()) {
      this.router.navigate(['/app/crm/clients', this.currentClientId()]);
    } else {
      this.router.navigate(['/app/crm/clients']);
    }
  }

  submit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const rawValue = this.clientForm.value;

    const payload = {
      name: rawValue.name,
      industry: rawValue.industry || undefined,
      website: rawValue.website || undefined,
      phone: rawValue.phone || undefined,
      fax: rawValue.fax || undefined,
      type: rawValue.type,
      source: rawValue.source,
      ownership: rawValue.ownership || undefined,
      annualRevenue: rawValue.annualRevenue || undefined,
      sicCode: rawValue.sicCode || undefined,
      description: rawValue.description || undefined,
      address: rawValue.address,
    };

    if (!this.isEditMode()) {
      this.clientsService.createClient(payload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(['/app/crm/clients']);
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Failed to create client', err);
        }
      });
    } else {
      const clientId = this.currentClientId();
      if (clientId) {
        this.clientsService.updateClient(clientId, payload).subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/app/crm/clients', clientId]);
          },
          error: (err) => {
            this.submitting.set(false);
            console.error('Failed to update client', err);
          }
        });
      }
    }
  }
}
