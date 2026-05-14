---
trigger: always_on
---

# Prolance — Agent Rules (Compressed)

## 1. Context

Prolance is a production-grade multi-tenant SaaS Project Management System for companies and software teams.

Features include:

- Projects, Workspaces, Milestones, Sprints
- Tasks, Subtasks, Kanban
- Teams, Roles, Members
- CRM (Leads, Opportunities, Clients)
- Time Tracking, Files, Notifications
- Analytics, Billing, Collaboration

This is a real enterprise SaaS platform focused on scalability, maintainability, security, clean architecture, and modern UX.

---

## 2. Stack & Architecture

### Frontend

- Angular latest
- Standalone Components
- Tailwind CSS + CSS Variables
- Feature-based architecture
- RxJS
- Reactive Forms
- RBAC
- Dark/Light mode via CSS variables

### Backend

- Java + Spring Boot
- Microservices + Hexagonal + DDD
- JWT + Keycloak
- REST APIs
- PostgreSQL
- Event-driven architecture
- Docker/Kubernetes/AWS-ready

---

## 3. Multi-Tenant Rules

- Every entity belongs to a tenant/workspace.
- Users only access their tenant data.
- Permissions differ per tenant.
- UI must always respect RBAC.
- Backend is the real security layer.

---

## 4. Angular Core Rules

- Always use Angular best practices.
- Prefer standalone components.
- Use strict typing; avoid `any`.
- Use interfaces/types for DTOs, requests, responses, and UI models.
- Keep components small and single-responsibility.
- Never place business logic in templates.
- Never call APIs directly from components.
- Use services/facades for API/state/business logic.
- Use RxJS correctly; avoid nested subscriptions.
- Prefer `async` pipe.
- Always handle loading, empty, success, and error states.
- Build as if the app will scale to hundreds of features.
- Always separate HTML from component TS unless template is tiny (~5 lines).

---

## 5. Folder-by-Feature Architecture

Always use feature-based structure:

```txt
src/app/features/<feature>/
  pages/
  components/
  services/
  types/
  guards/
  resolvers/
  store/
```

Example:

```txt
features/projects/
  pages/
  components/
  services/
  types/
```

Rules:

- Feature-specific code stays inside its feature.
- Do not place feature components/services in `shared/`.
- Pages compose components.
- Components render UI.
- Services handle logic.
- Allways seperate html from compnonent

---

## 6. Component & Page Rules

### Components

- One responsibility only.
- Split large UI into reusable pieces.
- Avoid components doing API calls + forms + permissions + tables together.

### Pages

Pages may:

- Load data
- Handle routing params
- Compose feature components
- Call services/facades
- Manage page state

Pages should not contain massive HTML blocks.

---

## 7. Services & Types

### Services

- Place services inside feature folders.
- Use for API calls, transformations, state coordination, business logic.
- Never inject `HttpClient` directly into components.

### Types

Each feature must own its own models:

```ts
export interface Project {}
export interface CreateProjectRequest {}
export interface ProjectResponse {}
```

Never mix:

- UI models
- Form models
- Backend DTOs

---

## 8. Routing

- Lazy load all features.
- Use guards when needed.
- Use route `data` for roles.

Example:

```ts
{
  path: 'projects/create',
  canActivate: [roleGuard],
  data: { roles: ['ADMIN'] }
}
```

---

## 9. Forms

Use Reactive Forms for enterprise forms.

Always include:

- Validation
- Inline errors
- Disabled/loading states
- Typed forms when possible
- Clear submit behavior

---

## 10. API Rules

Never hardcode backend URLs.

Bad:

```ts
this.http.get('http://localhost:8080/api/projects');
```

Good:

```ts
this.http.get(`${this.config.apiUrl}/projects`);
```

---

## 11. Error Handling

Every API interaction must handle errors.

Use:

- Toasts for temporary feedback
- Inline messages for forms
- Error states for pages/lists
- Retry only when meaningful

Never expose raw backend errors directly.

---

## 12. Role-Based UI Authorization

Always hide unauthorized actions.

Examples:

- Hide create/delete buttons
- Protect admin pages
- Protect routes with guards
- Use reusable permission directives

Example:

```html
<button *appHasRole="['ADMIN','PROJECT_MANAGER']">Create Project</button>
```

---

## 13. Styling Rules

Use global CSS variables only.

Token categories:

- `--color-*`
- `--font-*`
- `--text-*`
- `--spacing-*`
- `--radius-*`
- `--shadow-*`
- `--transition-*`
- `--z-*`

Never hardcode design values.

Bad:

```html
<div class="bg-white text-gray-700 p-6 rounded-xl shadow-md"></div>
```

Good:

```html
<div
  class="bg-[var(--color-card)] text-[var(--color-text)] p-[var(--spacing-lg)] rounded-[var(--radius-xl)] shadow-[var(--shadow-md)]"
></div>
```

### Tailwind Rules

Allowed for layout only:

```html
<div class="flex items-center justify-between grid grid-cols-3"></div>
```

Do not use Tailwind hardcoded design utilities.

### Dark Mode

Do not use `dark:` classes.
Use CSS variables globally.

Rule:

- Design value → CSS variable
- Layout behavior → Tailwind utility

---

## 14. Shared Folder Rules

`shared/` is only for reusable generic UI/utilities.

Allowed:

- Buttons
- Inputs
- Modals
- Tables
- Badges
- Pipes
- Directives
- Utilities
- Constants

Not allowed:

- Feature-specific cards/forms
- Feature-specific services
- Feature-specific business logic

If it belongs to one feature, keep it there.

---

## 15. Accessibility

Always build accessible UI.

Rules:

- Use semantic HTML
- Use `<button>` for actions
- Use `<a>` for navigation
- Associate labels with inputs
- Ensure keyboard accessibility
- Use proper contrast

---

## 16. UI Philosophy

Target modern enterprise SaaS quality.

Inspiration:

- Jira
- Linear
- Notion
- ClickUp
- Slack
- GitHub
- Vercel

UI must be:

- Clean
- Minimal
- Responsive
- Accessible
- Fast
- Spacious
- Consistent
- Dark-mode friendly

Every page must support:

- Loading state
- Empty state
- Error state
- Success state

Avoid:

- Cluttered layouts
- Inconsistent colors
- Old UI patterns
- Basic unfinished design

---

## 17. Final Rules

Never generate quick-and-dirty code.

Every generated file must follow:

- Feature-based architecture
- Strict typing
- RBAC
- Reusable shared components
- CSS variables only
- Modern enterprise UI
- Maintainable scalable structure
- Production-grade code quality
- Proper separation of concerns
- No overengineering
- No unnecessary complexity
- Angular Control Flow Rules

Always use the modern Angular built-in control flow syntax.

Use:

- `@if`
- `@for`
- `@switch`

Never use legacy structural directives:

- `*ngIf`
- `*ngFor`
- `*ngSwitch`

Bad:

```html
<div *ngIf="isLoading"></div>

<div *ngFor="let item of items"></div>
```

Good:

```html
@if (isLoading) {
<div></div>
} @for (item of items; track item.id) {
<div>{{ item.name }}</div>
}
```

Always use `track` in `@for` loops for rendering performance.

```

And yes, the template you uploaded is full of outdated Angular syntax everywhere (`*ngIf`, `*ngFor`). For a modern Angular enterprise app, that’s already behind. :contentReference[oaicite:0]{index=0}
```
