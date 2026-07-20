import { Component, inject, signal, OnInit } from '@angular/core';
import { ErrorMessageComponent } from '../../../../../shared/ui/error-message/error-message.component';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ContactsService } from '../../services/contacts.service';
import { Contact, InfluenceLevel } from '../../types/contact.model';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { DetailsSkeletonComponent } from '../../../../../shared/ui/skeletons/details-skeleton/details-skeleton.component';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../../../shared/ui/dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-contact-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TagModule, ButtonModule, LucideAngularModule, DetailsSkeletonComponent, DropdownMenuComponent, ErrorMessageComponent],
  templateUrl: './contact-details-page.component.html',
})
export class ContactDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contactsService = inject(ContactsService);

  readonly contact = signal<Contact | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<'overview' | 'timeline'>('overview');

  readonly ArrowLeft = ArrowLeft;

  ngOnInit(): void {
    this.loadContact();
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
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load contact details', err);
        this.error.set('Contact not found or failed to load contact details.');
        this.loading.set(false);
      }
    });
  }

  onEdit(): void {
    const currentContact = this.contact();
    if (currentContact) {
      this.router.navigate(['/app/crm/contacts', currentContact.id, 'edit']);
    }
  }

  onDelete(): void {
    const currentContact = this.contact();
    if (currentContact && confirm(`Are you sure you want to delete contact "${currentContact.firstName} ${currentContact.lastName}"?`)) {
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

  getInfluenceSeverity(level: InfluenceLevel): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<InfluenceLevel, 'success' | 'warn' | 'danger'> = {
      HIGH: 'danger',
      MEDIUM: 'warn',
      LOW: 'success',
    };
    return map[level] ?? 'secondary';
  }

  getFullName(): string {
    const c = this.contact();
    return c ? `${c.firstName} ${c.lastName}` : '';
  }

  readonly moreActions: DropdownMenuItem[] = [
    { label: 'Edit Contact', value: 'edit' },
    { label: 'Email Contact', value: 'email' },
    { label: 'Delete Contact', value: 'delete', danger: true, dividerBefore: true },
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
