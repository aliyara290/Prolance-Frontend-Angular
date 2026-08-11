import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkspaceSettings, TIMEZONES, LANGUAGES, INDUSTRIES } from '../../models/workspace.models';
import { WorkspaceService } from '../../service/workspace.service';
import { AuthService } from '../../../../../../core/auth/services/auth.service';

import { CustomSelectComponent, CustomSelectOption } from '../../../../../../shared/ui/custom-select/custom-select.component';

@Component({
  selector: 'app-workspace-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './workspace-settings.component.html',
})
export class WorkspaceSettingsComponent implements OnInit {
  private readonly workspaceService = inject(WorkspaceService);
  private readonly authService = inject(AuthService);

  readonly timezones  = TIMEZONES;
  readonly languages  = LANGUAGES;
  readonly industries = INDUSTRIES;

  readonly timezoneOptions: CustomSelectOption[] = this.timezones.map(t => ({ label: t, value: t }));
  readonly languageOptions: CustomSelectOption[] = this.languages.map(l => ({ label: l, value: l }));
  readonly industryOptions: CustomSelectOption[] = this.industries.map(i => ({ label: i, value: i }));

  saving  = signal(false);
  saved   = signal(false);
  loading = signal(true);

  tenantId: string = '';

  form: WorkspaceSettings = {
    name:        '',
    website:     '',
    description: '',
    logo:        '',
    size:        1,
    foundedDate: '',
    industry:    '',
    language:    'English',
    timezone:    'UTC+00:00 — London, Dublin',
    address: {
      street:     '',
      city:       '',
      state:      '',
      country:    '',
      zipCode:    '',
    },
  };

  ngOnInit(): void {
    const payload = this.authService.getParsedToken();
    if (payload && (payload.tenant_id || payload.tenantId)) {
      this.tenantId = payload.tenant_id || payload.tenantId || '';
      this.loadWorkspace();
    } else {
      this.loading.set(false);
    }
  }

  loadWorkspace(): void {
    this.workspaceService.getWorkspace(this.tenantId).subscribe({
      next: (data) => {
        this.form = {
          ...this.form,
          name: data.name || '',
          website: data.website || '',
          description: data.description || '',
          logo: data.logo || '',
          size: data.size || 1,
          foundedDate: data.foundedDate || '',
          industry: data.industry || '',
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            country: data.address?.country || '',
            zipCode: data.address?.zipCode || '',
          }
        };
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getInitials(): string {
    return this.form.name ? this.form.name.slice(0, 2).toUpperCase() : '';
  }

  onLogoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { this.form.logo = reader.result as string; };
    reader.readAsDataURL(file);
  }


  saveChanges(): void {
    this.saving.set(true);

    const request: any = {};

    // Strings
    if (this.form.name.trim()) {
      request.name = this.form.name.trim();
    }

    if (this.form.website.trim()) {
      request.website = this.form.website.trim();
    }

    if (this.form.description.trim()) {
      request.description = this.form.description.trim();
    }

    if (this.form.logo.trim()) {
      request.logo = this.form.logo.trim();
    }

    // Numbers
    if (this.form.size > 0) {
      request.size = this.form.size;
    }

    // Date
    if (this.form.foundedDate) {
      request.foundedDate = this.form.foundedDate;
    }

    // Address
    const address: any = {};

    if (this.form.address.street.trim()) {
      address.street = this.form.address.street.trim();
    }

    if (this.form.address.city.trim()) {
      address.city = this.form.address.city.trim();
    }

    if (this.form.address.state.trim()) {
      address.state = this.form.address.state.trim();
    }

    if (this.form.address.country.trim()) {
      address.country = this.form.address.country.trim();
    }

    if (this.form.address.zipCode.trim()) {
      address.zipCode = this.form.address.zipCode.trim();
    }

    if (Object.keys(address).length > 0) {
      request.address = address;
    }

    this.workspaceService.updateWorkspace(this.tenantId, request).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }
}
