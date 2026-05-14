---
trigger: always_on
---

# Prolance — Agent Rules

> Angular Enterprise SaaS · Production-grade · Multi-tenant

---

## 1. Project Context

**Prolance** is a real enterprise-grade multi-tenant SaaS Project Management System built for companies, agencies, startups, and software teams.

The platform manages:

- Projects, Workspaces, Milestones, Sprints
- Tasks, Subtasks, Kanban boards
- Teams, Members, Roles
- CRM: Leads, Opportunities, Clients, Contacts, Sales pipeline
- Time Tracking, Files/Documents
- Notifications, Mentions, Activity feeds
- Project Analytics, Billing/Invoices
- Team Collaboration

> This is not a demo project. It is a scalable enterprise SaaS platform designed for real-world architecture, clean code standards, security, maintainability, and modern UX.

---

## 2. Technical Architecture

### Frontend

| Concern       | Choice                       |
| ------------- | ---------------------------- |
| Framework     | Angular (latest)             |
| Components    | Standalone Components        |
| Styling       | Tailwind CSS + CSS Variables |
| Architecture  | Feature-based                |
| Reactivity    | RxJS                         |
| Forms         | Reactive Forms               |
| Authorization | Role-based (RBAC)            |
| Theme         | Dark/Light via CSS variables |

### Backend

| Concern        | Choice                              |
| -------------- | ----------------------------------- |
| Language       | Java                                |
| Framework      | Spring Boot                         |
| Architecture   | Microservices + Hexagonal + DDD     |
| Auth           | JWT + Keycloak                      |
| API            | REST                                |
| Messaging      | Event-driven                        |
| Database       | PostgreSQL                          |
| Infrastructure | Docker, Kubernetes-ready, AWS-ready |

---

## 3. Multi-Tenant Rules

Prolance is multi-tenant. Each company is fully isolated from others.

- Every entity belongs to a tenant/workspace.
- Users can only see their own tenant's data.
- Role permissions differ per tenant.
- Workspace/project visibility depends on permissions.
- UI actions must always respect roles and permissions.

> UI role checks are for user experience. Real security is always enforced by the backend.

---

## 4. Core Angular Rules

- Always follow Angular best practices.
- Always use **standalone components** unless the project explicitly uses modules.
- Always use **strict typing** — never use `any` unless there is a very strong reason.
- Prefer `interface` / `type` for DTOs, API responses, UI models, and request payloads.
- Keep components small and focused on a single responsibility.
- Do not put business logic directly inside templates.
- Do not put API logic directly inside components.
- Use services/facades for state, API calls, and business logic.
- Use RxJS properly — avoid nested subscriptions.
- Use the `async` pipe whenever possible.
- Always handle all four states: **loading**, **empty**, **success**, and **error**.
- Always write code as if the app will grow to hundreds of features.

---

## 5. Folder-by-Feature Architecture

Always use a feature-based folder structure.

Each feature must own its own:

```
src/app/features/<feature>/
  pages/
    <feature>-list/
    <feature>-details/
    create-<feature>/
  components/
    <feature>-card/
    <feature>-form/
    <feature>-status-badge/
  services/
    <feature>.service.ts
    <feature>-facade.service.ts
  types/
    <feature>.types.ts
    <feature>-request.types.ts
    <feature>-response.types.ts
  guards/         (if needed)
  resolvers/      (if needed)
  store/          (if needed)
```

### Example — Projects Feature

```
src/app/features/projects/
  pages/
    project-list/
    project-details/
    create-project/
  components/
    project-card/
    project-form/
    project-status-badge/
  services/
    project.service.ts
    project-facade.service.ts
  types/
    project.types.ts
    project-request.types.ts
    project-response.types.ts
```

### Rules

**Bad** — feature component placed in shared:

```
shared/components/project-card/   ❌
```

**Good** — feature component placed in feature:

```
features/projects/components/project-card/   ✅
```

Do not place feature-specific components in the global `shared/` folder.

---

## 6. Component Rules

Each component must be focused on one responsibility.

**Bad** — one component doing everything:

```
project-list.component.ts   ← API calls + filtering + permissions + modal logic + form logic + table logic
```

**Good** — responsibilities are split:

```
project-list-page/
project-table/
project-filters/
project-create-modal/
project-card/
```

> Pages compose components. Components display UI. Services handle logic.

---

## 7. Page Rules

Pages are route-level components.

Pages can:

- Load data on init
- Call facades/services
- Compose feature components
- Handle route params
- Handle page-level state

Pages should **not** contain large HTML blocks if the UI can be split into smaller feature components.

---

## 8. Service Rules

Feature services belong inside the feature folder:

```
features/projects/services/project.service.ts
```

Use services for:

- API calls
- Feature-specific business logic
- Data transformation
- State coordination

**Never inject `HttpClient` directly into components.**

**Bad:**

```ts
this.http.get('/api/projects'); // ❌
```

**Good:**

```ts
this.projectService.getProjects(); // ✅
```

---

## 9. Type Rules

Each feature must have its own `types/` folder:

```
features/projects/types/project.types.ts
```

Use clear, separated names:

```ts
// UI model
export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
}

// Request payload
export interface CreateProjectRequest {
  name: string;
  description?: string;
}

// API response DTO
export interface ProjectResponse {
  id: string;
  name: string;
  createdAt: string;
}
```

Do not mix backend DTOs, UI state, and form models. Separate them when needed.

---

## 10. Routing Rules

Use **lazy loading** for all features:

```ts
{
  path: 'projects',
  loadChildren: () =>
    import('./features/projects/projects.routes').then(m => m.PROJECTS_ROUTES)
}
```

- Protect routes with guards when needed.
- Use route `data` for roles and permissions:

```ts
{
  path: 'projects/create',
  canActivate: [roleGuard],
  data: {
    roles: ['ADMIN', 'PROJECT_MANAGER']
  }
}
```

---

## 11. Forms Rules

Use **Reactive Forms** for all serious forms.

Always include:

- Validation rules
- Inline error messages
- Disabled/loading states
- Clear submit behavior
- Proper form typing when possible

Do not build enterprise forms with uncontrolled template logic.

---

## 12. API Rules

Use environment/config values for all API URLs. Never hardcode backend URLs inside services.

**Bad:**

```ts
this.http.get('http://localhost:8080/api/projects'); // ❌
```

**Good:**

```ts
this.http.get(`${this.config.apiUrl}/projects`); // ✅
```

---

## 13. Error Handling Rules

Every API interaction must handle errors properly. Do not silently fail.

Use:

- Toasts for transient feedback
- Inline messages for form or field-level errors
- Error states for page/list-level failures
- Retry only when it makes sense

Never expose raw backend error messages directly to users.

---

## 14. Role-Based UI Authorization

Always respect role-based access control in the UI. Never show actions to users who do not have permission.

Examples:

- Hide "Create" button if the user cannot create.
- Hide "Delete" button if the user cannot delete.
- Hide admin pages from non-admin users.
- Protect routes using guards.
- Protect UI blocks using directives or permission helpers.

**Prefer reusable authorization directives** instead of repeating role checks everywhere:

```html
<button *appHasRole="['ADMIN', 'PROJECT_MANAGER']">Create Project</button>
```

---

## 15. Styling Rules

Always use the **global CSS variables** from `styles.css` for colors, spacing, radius, shadows, typography, layout, transitions, and z-index.

Do not hardcode design values inside Angular templates or component CSS.

### Token Categories

| Category      | Variable Pattern                                          |
| ------------- | --------------------------------------------------------- |
| Colors        | `--color-*`                                               |
| Font families | `--font-*`                                                |
| Font sizes    | `--text-*`                                                |
| Font weights  | `--font-weight-*`                                         |
| Spacing       | `--spacing-*`                                             |
| Border radius | `--radius-*`                                              |
| Shadows       | `--shadow-*`                                              |
| Layout sizes  | `--sidebar-width`, `--header-height`, `--container-width` |
| Transitions   | `--transition-*`                                          |
| Z-index       | `--z-*`                                                   |

### Never Use Hardcoded Values

```html
<!-- ❌ Bad -->
<div class="bg-blue-500 text-gray-500 p-6 rounded-xl shadow-md">
  <!-- ✅ Good -->
  <div
    class="bg-[var(--color-primary)] text-[var(--color-text-secondary)] p-[var(--spacing-lg)] rounded-[var(--radius-xl)] shadow-[var(--shadow-md)]"
  ></div>
</div>
```

### Tailwind Usage

Tailwind utility classes are allowed **only** when they describe layout behavior, not design values.

**Allowed:**

```html
<div class="flex items-center justify-between grid grid-cols-3 min-h-screen"></div>
```

**Not allowed:**

```html
<div class="bg-white text-gray-700 p-6 rounded-xl shadow-md"></div>
```

### Dark Mode

Do **not** use separate dark-mode classes:

```html
<!-- ❌ Bad -->
<div class="bg-white dark:bg-slate-900 text-black dark:text-white"></div>
```

Instead, rely entirely on CSS variables. The `.dark` class updates the variables globally:

```html
<!-- ✅ Good -->
<div class="bg-[var(--color-card)] text-[var(--color-text)]"></div>
```

### Rule of Thumb

> Before writing any class, ask: **"Is this a design value?"**
>
> - If **yes** → use a CSS variable.
> - If **no** → use normal Tailwind.

---

## 16. Shared Folder Rules

The `shared/` folder is **only** for truly reusable UI or utility code used across multiple features.

```
src/app/shared/
  components/
    button/
    modal/
    input/
    badge/
    table/
  pipes/
  directives/
  utils/
  constants/
```

**Allowed in shared:**

- Buttons, Inputs, Modals, Tables, Badges
- Layout helpers
- Pipes and Directives
- Generic utilities and constants

**Not allowed in shared:**

- Feature-specific cards or forms
- Feature-specific business logic
- Feature-specific API services

> If it only belongs to one feature, keep it inside that feature.

---

## 17. Accessibility Rules

Always write accessible UI.

- Use semantic HTML elements (`<button>`, `<a>`, `<label>`, `<nav>`, `<main>`, etc.)
- Use `<button>` for actions, `<a>` for navigation — never reverse them.
- Always associate `<label>` with form inputs.
- Use `aria-*` attributes only when semantic HTML is not sufficient.
- Ensure all interactive elements are keyboard-friendly.
- Maintain good color contrast using CSS variables.

---

## 18. UI Philosophy

The UI must feel like a modern enterprise SaaS product.

**Design inspiration:** Jira · Linear · Notion · ClickUp · Monday · Slack · GitHub · Vercel

The UI must be:

- Clean and minimal
- Professional and consistent
- Fast and smooth
- Spacious and highly readable
- Responsive and accessible
- Dark-mode friendly
- Easy to scan

Every page must include:

- Proper spacing and visual hierarchy
- All data states: loading, empty, error, success
- Responsive behavior across screen sizes

**Avoid:**

- Cluttered layouts
- Random or inconsistent colors
- Unfinished or basic-looking UI
- Old-looking design patterns

## 19. Final Rule

> Do not generate quick-and-dirty code.

This is an enterprise SaaS Angular application. Every generated file must respect:

- ✅ Feature-based architecture
- ✅ Aleays seperate the html from component unless the html is just like 5 lines of code
- ✅ Strict typing (no `any`)
- ✅ Role-based UI authorization
- ✅ Reusable shared components
- ✅ Global CSS variables only
- ✅ Modern, clean enterprise UI
- ✅ Maintainable, scalable structure
- ✅ Production-level code quality
