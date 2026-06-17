import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClientsService } from '../../services/clients.service';
import { Client, ClientStatus } from '../../types/client.model';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import {DetailsSkeletonComponent} from '../../../../../shared/ui/skeletons/details-skeleton/details-skeleton.component';

@Component({
  selector: 'app-client-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TagModule, ButtonModule, LucideAngularModule, DetailsSkeletonComponent],
  templateUrl: './client-details-page.component.html',
})
export class ClientDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientsService = inject(ClientsService);

  readonly client = signal<Client | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<'overview' | 'timeline'>('overview');

  readonly ArrowLeft = ArrowLeft;

  ngOnInit(): void {
    this.loadClient();
  }

  loadClient(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No Client ID provided in route.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.clientsService.getClient(id).subscribe({
      next: (res) => {
        this.client.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load client details', err);
        this.error.set('Client not found or failed to load client details.');
        this.loading.set(false);
      }
    });
  }

  onEdit(): void {
    const currentClient = this.client();
    if (currentClient) {
      this.router.navigate(['/app/crm/clients', currentClient.id, 'edit']);
    }
  }

  onDelete(): void {
    const currentClient = this.client();
    if (currentClient && confirm(`Are you sure you want to delete client "${currentClient.name}"?`)) {
      this.clientsService.deleteClient(currentClient.id).subscribe({
        next: () => {
          this.router.navigate(['/app/crm/clients']);
        },
        error: (err) => {
          console.error('Failed to delete client', err);
          alert('Failed to delete client.');
        }
      });
    }
  }

  getStatusSeverity(status: ClientStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null {
    const map: Record<ClientStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      ACTIVE: 'success',
      INACTIVE: 'warn',
      ARCHIVED: 'secondary',
    };
    return map[status] ?? 'secondary';
  }
}
