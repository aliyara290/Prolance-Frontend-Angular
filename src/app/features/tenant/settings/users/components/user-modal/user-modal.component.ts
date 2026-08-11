import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersStateService } from '../../service/users-state.service';
import { ALL_ROLES, ALL_DEPARTMENTS, UserRole, CreateUserPayload, EDUCATION_LEVELS, SENIORITY_LEVELS } from '../../models/user.models';
import { getRoleBadgeClass, getRoleLabel } from '../../util/user.utils';
import { CustomSelectComponent, CustomSelectOption } from '../../../../../../shared/ui/custom-select/custom-select.component';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  host: { style: 'display:contents' },
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './user-modal.component.html',
})
export class UserModalComponent {
  private state = inject(UsersStateService);

  readonly allRoles       = ALL_ROLES;
  readonly allDepartments = ALL_DEPARTMENTS;
  readonly educationLevels = EDUCATION_LEVELS;
  readonly seniorityLevels = SENIORITY_LEVELS;

  readonly departmentSelectOptions: CustomSelectOption[] = this.allDepartments.map(d => ({ label: d, value: d }));
  readonly educationSelectOptions: CustomSelectOption[] = this.educationLevels.map(e => ({ label: e, value: e }));
  readonly senioritySelectOptions: CustomSelectOption[] = this.seniorityLevels.map(s => ({ label: s, value: s }));

  getRoleBadgeClass = getRoleBadgeClass;
  getRoleLabel      = getRoleLabel;

  isOpen    = signal(false);
  step      = signal<1 | 2>(1);

  firstName  = '';
  lastName   = '';
  email      = '';
  username   = '';
  password   = '';
  jobTitle   = '';
  department = '';
  educationLevel = '';
  seniorityLevel = '';
  baseHourlySalary: number | null = null;

  selectedRoles = signal<Set<UserRole>>(new Set(['MEMBER']));

  get isStep1Valid(): boolean {
    return !!(this.email && this.firstName && this.lastName && this.username && this.password);
  }

  get isStep2Valid(): boolean {
    return this.selectedRoles().size > 0;
  }

  hasRole(role: UserRole): boolean {
    return this.selectedRoles().has(role);
  }

  // ── Actions ──
  open(): void {
    this.reset();
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  goToStep(step: 1 | 2): void {
    this.step.set(step);
  }

  nextStep(): void {
    if (this.isStep1Valid) this.step.set(2);
  }

  toggleRole(role: UserRole): void {
    this.selectedRoles.update(roles => {
      const copy = new Set(roles);
      copy.has(role) ? copy.delete(role) : copy.add(role);
      return copy;
    });
  }

  submit(): void {
    if (!this.isStep1Valid || !this.isStep2Valid) return;
    const payload: CreateUserPayload = {
      username:   this.username,
      email:      this.email,
      firstName:  this.firstName,
      lastName:   this.lastName,
      password:   this.password,
      roles:      Array.from(this.selectedRoles()),
      jobTitle:   this.jobTitle   || undefined,
      department: this.department || undefined,
      educationLevel: this.educationLevel || undefined,
      seniorityLevel: this.seniorityLevel || undefined,
      baseHourlySalary: this.baseHourlySalary !== null ? this.baseHourlySalary : undefined,
    };
    this.state.createUser(payload);
    this.close();
  }

  private reset(): void {
    this.step.set(1);
    this.firstName  = '';
    this.lastName   = '';
    this.email      = '';
    this.username   = '';
    this.password   = '';
    this.jobTitle   = '';
    this.department = '';
    this.educationLevel = '';
    this.seniorityLevel = '';
    this.baseHourlySalary = null;
    this.selectedRoles.set(new Set(['MEMBER']));
  }
}
