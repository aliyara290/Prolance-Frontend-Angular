import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  User, Mail, Lock, Globe, Clock, Shield,
  Camera, Check, ChevronDown, CheckCircle2, ExternalLink,
} from 'lucide-angular';

@Component({
  selector: 'app-personal-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './personal-settings.component.html',
})
export class PersonalSettingsComponent implements OnInit {

  // ── Icons ──────────────────────────────────────────────────────────────────
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

  // ── State ──────────────────────────────────────────────────────────────────
  avatarPreview = signal<string | null>(null);
  toastMessage  = signal<string | null>(null);

  // ── Form ───────────────────────────────────────────────────────────────────
  profileForm!: FormGroup;

  timezones = [
    'UTC−12:00 — Baker Island',
    'UTC−08:00 — Pacific Time (US)',
    'UTC−07:00 — Mountain Time (US)',
    'UTC−06:00 — Central Time (US)',
    'UTC−05:00 — Eastern Time (US)',
    'UTC+00:00 — London (GMT)',
    'UTC+01:00 — Paris, Berlin',
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
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
    { code: 'es', label: 'Español' },
    { code: 'de', label: 'Deutsch' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
    { code: 'pt', label: 'Português' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: ['Ali',                  [Validators.required, Validators.minLength(2)]],
      lastName:  ['Yara',                 [Validators.required, Validators.minLength(2)]],
      email:     ['ali.yara@prolance.io', [Validators.required, Validators.email]],
      timezone:  ['UTC+03:00 — Riyadh, Moscow', Validators.required],
      language:  ['en',                   Validators.required],
    });
  }

  // ── Avatar ─────────────────────────────────────────────────────────────────
  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  // ── Save profile ───────────────────────────────────────────────────────────
  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.showToast('Profile updated successfully.');
  }

  // ── Keycloak redirects (wire up with your KeycloakService) ─────────────────
  redirectToKeycloakPassword(): void {
    // e.g. this.keycloak.login({ action: 'UPDATE_PASSWORD' });
  }

  redirectToKeycloak2FA(): void {
    // e.g. this.keycloak.login({ action: 'CONFIGURE_TOTP' });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  hasError(form: FormGroup, field: string, error?: string): boolean {
    const ctrl = form.get(field);
    if (!ctrl || !ctrl.touched) return false;
    return error ? ctrl.hasError(error) : ctrl.invalid;
  }

  private showToast(text: string): void {
    this.toastMessage.set(text);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }
}
