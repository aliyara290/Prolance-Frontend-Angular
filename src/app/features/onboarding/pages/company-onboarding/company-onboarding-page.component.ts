import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TenantRegisterService } from '../../services/tenant-register.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { authInitSuccess } from '../../../../core/auth/store/auth.actions';
import {
  TenantIndustry,
  TenantRegisterRequest,
  INDUSTRY_OPTIONS
} from '../../types/tenant-register.types';

@Component({
  selector: 'app-company-onboarding-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-onboarding-page.component.html',
  styleUrl: './company-onboarding-page.component.css'
})
export class CompanyOnboardingPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly tenantRegisterService = inject(TenantRegisterService);
  private readonly authService = inject(AuthService);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly industryOptions = INDUSTRY_OPTIONS;
  protected readonly isDropdownOpen = signal(false);

  protected readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    companyEmail: ['', [Validators.required, Validators.email]],
    website: ['', [Validators.pattern(/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}.*$/)]],
    industry: [null as TenantIndustry | null, [Validators.required]]
  });

  protected get selectedIndustryLabel(): string {
    const value = this.form.get('industry')?.value as TenantIndustry | null;
    if (!value) return '';
    return this.industryOptions.find(o => o.value === value)?.label ?? '';
  }

  protected selectIndustry(option: { label: string; value: TenantIndustry }): void {
    this.form.get('industry')?.setValue(option.value);
    this.form.get('industry')?.markAsTouched();
    this.isDropdownOpen.set(false);
  }

  protected toggleDropdown(): void {
    this.isDropdownOpen.update(v => !v);
  }

  protected closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const request: TenantRegisterRequest = {
      name: this.form.value.name.trim(),
      companyEmail: this.form.value.companyEmail.trim(),
      website: this.form.value.website?.trim() ?? '',
      industry: this.form.value.industry
    };

    this.tenantRegisterService.register(request).subscribe({
      next: async () => {
        try {
          // Force token refresh to pick up the new tenant_id claim
          await this.authService.updateToken(-1);
          const token = this.authService.getToken();
          const payload = this.authService.getParsedToken();

          if (token && payload) {
            this.store.dispatch(authInitSuccess({ token, payload }));
          }

          await this.router.navigate(['/app/dashboard']);
        } catch {
          // Even if token refresh fails, navigate — the guard will re-check
          await this.router.navigate(['/app/dashboard']);
        } finally {
          this.isSubmitting.set(false);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const message = err?.error?.message
          || err?.error?.errors?.join(', ')
          || 'Something went wrong. Please try again.';
        this.errorMessage.set(message);
      }
    });
  }

  protected hasError(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.hasError(errorType) && control.touched;
  }

  protected isFieldInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && control.touched;
  }
}
