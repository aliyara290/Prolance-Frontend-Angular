import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { LeadsService } from '../../services/leads.service';
import { ClientsService } from '../../../clients/services/clients.service';
import { ContactsService } from '../../../contacts/services/contacts.service';
import { LeadStatus, Priority, Source } from '../../types/lead.model';
import { Client } from '../../../clients/types/client.model';
import { Contact } from '../../../contacts/types/contact.model';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-lead-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './lead-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly leadsService = inject(LeadsService);
  private readonly clientsService = inject(ClientsService);
  private readonly contactsService = inject(ContactsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isEditMode = signal(false);
  readonly currentLeadId = signal<string | null>(null);

  readonly clientMode = signal<'select' | 'new'>('select');
  readonly contactMode = signal<'select' | 'new'>('select');

  readonly clients = signal<Client[]>([]);
  readonly contacts = signal<Contact[]>([]);

  readonly priorityOptions: Priority[] = ['HIGH', 'MEDIUM', 'LOW'];
  readonly statusOptions: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED'];
  readonly sourceOptions: Source[] = ['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'COLD_CALL', 'EVENT', 'OTHER'];

  readonly ArrowLeft = ArrowLeft;

  leadForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();
    this.checkEditMode();
  }

  private initForm(): void {
    this.leadForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      source: ['COLD_CALL', [Validators.required]],
      priority: ['MEDIUM', [Validators.required]],
      status: ['NEW', [Validators.required]],
      assignedTo: ['b68243e7-5651-472c-bcf3-47cdd24533af'],
      phone: [''],
      industry: [''],
      annualRevenue: [null],
      company: [''],
      email: ['', [Validators.email]],
      website: [''],
      numberOfEmployees: [null],
      address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
      }),
      clientId: [''],
      contactId: [''],
      client: this.fb.group({
        name: [''],
        industry: [''],
        website: [''],
        phone: [''],
        type: ['ENTERPRISE'],
        source: ['COLD_CALL'],
        annualRevenue: [null],
        ownership: ['PRIVATE'],
        description: [''],
        address: this.fb.group({
          street: [''],
          city: [''],
          state: [''],
          country: [''],
          zipCode: [''],
        }),
      }),
      contact: this.fb.group({
        firstName: [''],
        lastName: [''],
        email: ['', [Validators.email]],
        phone: [''],
        role: ['CEO'],
        influenceLevel: ['MEDIUM'],
        primary: [true],
        department: [''],
        dateOfBirth: [''],
        secondaryEmail: ['', [Validators.email]],
        description: [''],
        address: this.fb.group({
          street: [''],
          city: [''],
          state: [''],
          country: [''],
          zipCode: [''],
        }),
      }),
    });

    this.leadForm.get('clientId')?.valueChanges.subscribe(val => {
      if (val) this.clientMode.set('select');
    });
    this.leadForm.get('contactId')?.valueChanges.subscribe(val => {
      if (val) this.contactMode.set('select');
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.currentLeadId.set(id);
      this.loadLeadDetails(id);
    }
  }

  private loadLeadDetails(id: string): void {
    this.leadsService.getLead(id).subscribe({
      next: (res) => {
        const lead = res.data;
        if (lead) {
          this.leadForm.patchValue({
            title: lead.title,
            description: lead.description,
            source: lead.source,
            priority: lead.priority,
            status: lead.status,
            assignedTo: lead.assignedTo,
            phone: lead.phone,
            industry: lead.industry,
            annualRevenue: lead.annualRevenue,
            company: lead.company,
            email: lead.email,
            website: lead.website,
            numberOfEmployees: lead.numberOfEmployees,
            address: lead.address || { street: '', city: '', state: '', country: '', zipCode: '' },
            clientId: lead.clientId || '',
            contactId: lead.contactId || ''
          });
        }
      },
      error: (err) => console.error('Failed to load lead', err)
    });
  }

  loadDropdownData(): void {
    this.clientsService.getClients().subscribe({
      next: (res) => this.clients.set(res.data || []),
      error: (err) => console.error('Failed to load clients', err)
    });

    this.contactsService.getContacts().subscribe({
      next: (res) => this.contacts.set(res.data || []),
      error: (err) => console.error('Failed to load contacts', err)
    });
  }

  setClientMode(mode: 'select' | 'new'): void {
    this.clientMode.set(mode);
    const clientNameControl = this.leadForm.get('client.name');
    if (mode === 'new') {
      clientNameControl?.setValidators([Validators.required]);
      this.leadForm.get('clientId')?.setValue('');
    } else {
      clientNameControl?.clearValidators();
    }
    clientNameControl?.updateValueAndValidity();
  }

  setContactMode(mode: 'select' | 'new'): void {
    this.contactMode.set(mode);
    const contactFirstControl = this.leadForm.get('contact.firstName');
    const contactLastControl = this.leadForm.get('contact.lastName');
    const contactEmailControl = this.leadForm.get('contact.email');
    const contactPhoneControl = this.leadForm.get('contact.phone');

    if (mode === 'new') {
      contactFirstControl?.setValidators([Validators.required]);
      contactLastControl?.setValidators([Validators.required]);
      contactEmailControl?.setValidators([Validators.required, Validators.email]);
      contactPhoneControl?.setValidators([Validators.required]);
      this.leadForm.get('contactId')?.setValue('');
    } else {
      contactFirstControl?.clearValidators();
      contactLastControl?.clearValidators();
      contactEmailControl?.clearValidators();
      contactPhoneControl?.clearValidators();
    }
    contactFirstControl?.updateValueAndValidity();
    contactLastControl?.updateValueAndValidity();
    contactEmailControl?.updateValueAndValidity();
    contactPhoneControl?.updateValueAndValidity();
  }

  cancel(): void {
    this.router.navigate(['/app/crm/leads']);
  }

  submit(): void {
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      return;
    }

    const rawValue = this.leadForm.value;
    const payload: any = {
      title: rawValue.title,
      description: rawValue.description,
      source: rawValue.source,
      priority: rawValue.priority,
      status: rawValue.status,
      assignedTo: rawValue.assignedTo,
      phone: rawValue.phone || null,
      industry: rawValue.industry,
      annualRevenue: rawValue.annualRevenue,
      company: rawValue.company,
      email: rawValue.email,
      website: rawValue.website,
      numberOfEmployees: rawValue.numberOfEmployees,
      address: rawValue.address,
    };

    if (!this.isEditMode()) {
      if (this.clientMode() === 'select' && rawValue.clientId) {
        payload.clientId = rawValue.clientId;
      } else if (this.clientMode() === 'new' && rawValue.client?.name) {
        payload.client = rawValue.client;
      }

      if (this.contactMode() === 'select' && rawValue.contactId) {
        payload.contactId = rawValue.contactId;
      } else if (this.contactMode() === 'new' && rawValue.contact?.firstName) {
        payload.contact = rawValue.contact;
      }

      this.leadsService.createLead(payload).subscribe({
        next: () => {
          this.router.navigate(['/app/crm/leads']);
        },
        error: (err) => console.error('Failed to create lead', err)
      });
    } else {
      const leadId = this.currentLeadId();
      if (leadId) {
        this.leadsService.updateLead(leadId, payload).subscribe({
          next: () => {
            this.router.navigate(['/app/crm/leads', leadId]);
          },
          error: (err) => console.error('Failed to update lead', err)
        });
      }
    }
  }
}
