import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../../core/config/config.service';
import { Contact, CreateContactRequest } from '../types/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get apiUrl(): string {
    return `${this.config.value.apiGatewayUrl}/crm/api/v1/contacts`;
  }

  getContacts(): Observable<{ success: boolean; data: Contact[] }> {
    return this.http.get<{ success: boolean; data: Contact[] }>(this.apiUrl);
  }

  createContact(request: CreateContactRequest): Observable<{ success: boolean; data: Contact }> {
    return this.http.post<{ success: boolean; data: Contact }>(this.apiUrl, request);
  }
}
