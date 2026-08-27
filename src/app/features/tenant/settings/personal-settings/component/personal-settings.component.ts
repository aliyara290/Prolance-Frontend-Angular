import {Component, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  User, Mail, Lock, Globe, Clock, Shield,
  Camera, Check, ChevronDown, CheckCircle2, ExternalLink,
} from 'lucide-angular';
import {AuthService} from '../../../../../core/auth/services/auth.service';
import {Store} from '@ngrx/store';
import {selectAuthUser} from '../../../../../core/auth/store/auth.selectors';

import { CustomSelectComponent, CustomSelectOption } from '../../../../../shared/ui/custom-select/custom-select.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-personal-settings',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CustomSelectComponent, FormsModule],
  templateUrl: './personal-settings.component.html',
})
export class PersonalSettingsComponent {

  readonly UserIcon         = User;
  readonly MailIcon         = Mail;
  readonly LockIcon         = Lock;
  readonly GlobeIcon        = Globe;
  readonly ClockIcon        = Clock;
  readonly ShieldIcon       = Shield;
  readonly CameraIcon       = Camera;
  readonly CheckIcon        = Check;
  readonly ChevronDownIcon  = ChevronDown;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly ExternalLinkIcon = ExternalLink;

  avatarPreview = signal<string | null>(null);

  private readonly authService = inject(AuthService);
  private readonly store = inject(Store);

  protected readonly user$ = this.store.select(selectAuthUser);

  timezones = [
    'UTC+01:00 — Casablanca, Morocco',
    'UTC−12:00 — Baker Island',
    'UTC−08:00 — Pacific Time (US)',
    'UTC−07:00 — Mountain Time (US)',
    'UTC−06:00 — Central Time (US)',
    'UTC−05:00 — Eastern Time (US)',
    'UTC+00:00 — London (GMT)',
    'UTC+02:00 — Cairo, Athens',
    'UTC+03:00 — Riyadh, Moscow',
    'UTC+05:30 — Mumbai, Kolkata',
    'UTC+08:00 — Beijing, Singapore',
    'UTC+09:00 — Tokyo, Seoul',
    'UTC+10:00 — Sydney',
    'UTC+12:00 — Auckland',
  ];

  languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' }
  ];

  readonly timezoneOptions: CustomSelectOption[] = this.timezones.map(t => ({ label: t, value: t }));
  readonly languageOptions: CustomSelectOption[] = this.languages.map(l => ({ label: l.label, value: l.code }));

  selectedTimezone = 'UTC+01:00 — Casablanca, Morocco';
  selectedLanguage = 'en';


  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async onUpdatePassword(): Promise<void> {
    try {
      await this.authService.updatePassword();
    } catch (error) {
      console.error('Failed to start updating password!', error);
    }
  }

  async onEnable2FA(): Promise<void> {
    try {
      await this.authService.add2FA();
    } catch (error) {
      console.error('Failed to start 2FA setup', error);
    }
  }

}
