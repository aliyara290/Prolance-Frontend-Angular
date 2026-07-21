import { Component, inject, signal, OnInit, ChangeDetectionStrategy, computed, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ContactsService } from '../../services/contacts.service';
import { ClientsService } from '../../../clients/services/clients.service';
import { Role, InfluenceLevel, Department } from '../../types/contact.model';
import { Client } from '../../../clients/types/client.model';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { CustomSelectComponent, CustomSelectOption } from '../../../../../shared/ui/custom-select/custom-select.component';

@Component({
  selector: 'app-contact-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule, CustomSelectComponent],
  templateUrl: './contact-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly contactsService = inject(ContactsService);
  private readonly clientsService = inject(ClientsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isEditMode = signal(false);
  readonly currentContactId = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly clients = signal<Client[]>([]);

  readonly roleOptions: Role[] = ['CEO', 'INFLUENCER', 'DIRECTOR', 'BUYER'];
  readonly influenceLevelOptions: InfluenceLevel[] = ['HIGH', 'MEDIUM', 'LOW'];
  readonly departmentOptions: Department[] = [
    'TECHNOLOGY', 'FINANCE', 'HEALTHCARE', 'EDUCATION',
    'MANUFACTURING', 'CONSULTING', 'MEDIA', 'REAL_ESTATE',
    'TRANSPORTATION', 'ENERGY', 'AGRICULTURE', 'RETAIL', 'OTHER'
  ];

  readonly ArrowLeft = ArrowLeft;
  readonly clientOptions = computed<CustomSelectOption[]>(() => 
    this.clients().map(c => ({
      value: c.id,
      label: c.name,
      subLabel: c.industry,
      avatarName: c.name
    }))
  );

  readonly roleSelectOptions: CustomSelectOption[] = this.roleOptions.map(r => ({ label: r, value: r }));
  readonly influenceLevelSelectOptions: CustomSelectOption[] = this.influenceLevelOptions.map(l => ({ label: l, value: l }));
  readonly departmentSelectOptions: CustomSelectOption[] = this.departmentOptions.map(d => ({ label: d, value: d }));

  contactForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.checkEditMode();
  }

  private initForm(): void {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      clientId: [''],
      role: ['CEO', [Validators.required]],
      influenceLevel: ['MEDIUM', [Validators.required]],
      primary: [true],
      notes: [''],
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
      this.currentContactId.set(id);
      this.loadContactDetails(id);
    }
  }

  private loadContactDetails(id: string): void {
    this.contactsService.getContact(id).subscribe({
      next: (res) => {
        const contact = res.data;
        if (contact) {
          this.contactForm.patchValue({
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            clientId: contact.clientId || '',
            role: contact.role,
            influenceLevel: contact.influenceLevel,
            primary: contact.primary,
            notes: contact.notes || '',
            department: contact.department || '',
            dateOfBirth: contact.dateOfBirth || '',
            secondaryEmail: contact.secondaryEmail || '',
            description: contact.description || '',
            address: contact.address || { street: '', city: '', state: '', country: '', zipCode: '' },
          });
        }
      },
      error: (err) => console.error('Failed to load contact', err)
    });
  }

  cancel(): void {
    if (this.isEditMode() && this.currentContactId()) {
      this.router.navigate(['/app/crm/contacts', this.currentContactId()]);
    } else {
      this.router.navigate(['/app/crm/contacts']);
    }
  }

  submit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const rawValue = this.contactForm.value;

    const payload = {
      firstName: rawValue.firstName,
      lastName: rawValue.lastName,
      email: rawValue.email,
      phone: rawValue.phone,
      clientId: rawValue.clientId || undefined,
      role: rawValue.role,
      influenceLevel: rawValue.influenceLevel,
      primary: rawValue.primary,
      notes: rawValue.notes || undefined,
      department: rawValue.department || undefined,
      dateOfBirth: rawValue.dateOfBirth || undefined,
      secondaryEmail: rawValue.secondaryEmail || undefined,
      description: rawValue.description || undefined,
      address: rawValue.address,
    };

    if (!this.isEditMode()) {
      this.contactsService.createContact(payload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(['/app/crm/contacts']);
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Failed to create contact', err);
        }
      });
    } else {
      const contactId = this.currentContactId();
      if (contactId) {
        this.contactsService.updateContact(contactId, payload).subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/app/crm/contacts', contactId]);
          },
          error: (err) => {
            this.submitting.set(false);
            console.error('Failed to update contact', err);
          }
        });
      }
    }
  }
}
