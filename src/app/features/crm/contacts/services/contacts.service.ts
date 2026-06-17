import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ConfigService } from '../../../../core/config/config.service';
import { Contact, CreateContactRequest, UpdateContactRequest, ContactsListMeta } from '../types/contact.model';

interface ContactsResponse {
  success: boolean;
  data: Contact[];
  meta: ContactsListMeta | null;
}

interface SingleContactResponse {
  success: boolean;
  data: Contact;
}

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get apiUrl(): string {
    return `${this.config.value.apiGatewayUrl}/crm/api/v1/contacts`;
  }

  readonly contacts = signal<Contact[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly totalCount = signal<number>(0);
  readonly meta = signal<ContactsListMeta | null>(null);

  loadContacts(page?: number, size?: number, name?: string): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());
    if (name) params = params.set('name', name);

    this.http.get<ContactsResponse>(this.apiUrl, { params }).subscribe({
      next: (res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
        this.contacts.set(data);
        this.meta.set(res.meta);
        this.totalCount.set(res.meta?.totalElements ?? data.length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load contacts', err);
        this.error.set('Failed to load contacts from the server.');
        this.loading.set(false);
      }
    });
  }

  getContacts(): Observable<{ success: boolean; data: Contact[] }> {
    return this.http.get<{ success: boolean; data: Contact[] }>(this.apiUrl);
  }

  getContact(id: string): Observable<SingleContactResponse> {
    return this.http.get<SingleContactResponse>(`${this.apiUrl}/${id}`);
  }

  createContact(request: CreateContactRequest): Observable<SingleContactResponse> {
    return this.http.post<SingleContactResponse>(this.apiUrl, request).pipe(
      tap(() => this.loadContacts())
    );
  }

  updateContact(id: string, payload: UpdateContactRequest): Observable<SingleContactResponse> {
    return this.http.put<SingleContactResponse>(`${this.apiUrl}/${id}`, payload).pipe(
      tap(() => this.loadContacts())
    );
  }

  deleteContact(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadContacts())
    );
  }
}
