import { Component, inject, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDetailService } from '../../../services/project-detail.service';
import { UsersStateService } from '../../../../tenant/settings/users/service/users-state.service';
import { ClientsService } from '../../../../crm/clients/services/clients.service';

@Component({
  selector: 'app-project-detail-overview-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-detail-overview-page.component.html',
  styleUrls: ['./project-detail-overview-page.component.css'],
})
export class ProjectDetailOverviewPageComponent {
  readonly detailService = inject(ProjectDetailService);
  private readonly usersStateService = inject(UsersStateService);
  private readonly clientsService = inject(ClientsService);

  readonly tenantUsers = this.usersStateService.usersList;
  readonly clientName = signal<string | null>(null);

  readonly ownerName = computed(() => {
    const ownerId = this.detailService.project()?.ownerId;
    if (!ownerId) return '-';
    const user = this.tenantUsers().find(u => u.keycloakUserId === ownerId);
    return user ? `${user.firstName} ${user.lastName}` : ownerId;
  });

  constructor() {
    effect(() => {
      const project = this.detailService.project();
      if (project?.clientId) {
        // Find in loaded clients or fetch
        const existing = this.clientsService.clients().find(c => c.id === project.clientId);
        if (existing) {
          this.clientName.set(existing.name);
        } else {
          this.clientsService.getClient(project.clientId).subscribe({
            next: (res) => {
              if (res.data) {
                this.clientName.set(res.data.name);
              }
            }
          });
        }
      } else {
        this.clientName.set(null);
      }
    }, { allowSignalWrites: true });
  }
}

