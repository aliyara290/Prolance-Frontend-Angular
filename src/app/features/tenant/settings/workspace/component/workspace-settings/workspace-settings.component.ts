import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkspaceSettings, TIMEZONES, LANGUAGES, INDUSTRIES } from '../../models/workspace.models';

import { CustomSelectComponent, CustomSelectOption } from '../../../../../../shared/ui/custom-select/custom-select.component';

@Component({
  selector: 'app-workspace-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './workspace-settings.component.html',
})
export class WorkspaceSettingsComponent {
  readonly timezones  = TIMEZONES;
  readonly languages  = LANGUAGES;
  readonly industries = INDUSTRIES;

  readonly timezoneOptions: CustomSelectOption[] = this.timezones.map(t => ({ label: t, value: t }));
  readonly languageOptions: CustomSelectOption[] = this.languages.map(l => ({ label: l, value: l }));
  readonly industryOptions: CustomSelectOption[] = this.industries.map(i => ({ label: i, value: i }));

  saving  = signal(false);
  saved   = signal(false);

  form: WorkspaceSettings = {
    name:        'InovSmart',
    website:     'https://inovsmart.com',
    description: 'A next-generation CRM platform for modern sales teams.',
    logo:        '',
    size:        30,
    foundedDate: '2021-03-15',
    industry:    'TECHNOLOGY',
    language:    'English',
    timezone:    'UTC+00:00 — London, Dublin',
    address: {
      street:     '12 Rue Hassan II',
      city:       'Casablanca',
      state:      'Casablanca-Settat',
      country:    'Morocco',
      postalCode: '20000',
    },
  };

  getInitials(): string {
    return this.form.name.slice(0, 2).toUpperCase();
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
    setTimeout(() => {
      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 3000);
    }, 800);
  }
}
