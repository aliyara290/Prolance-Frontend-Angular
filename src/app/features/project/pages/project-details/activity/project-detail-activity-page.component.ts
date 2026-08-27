import { Component, inject, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectDetailService } from '../../../services/project-detail.service';
import { UserApiService } from '../../../../../core/auth/services/user-api.service';
import {
  LucideAngularModule, Plus, Edit2, Trash2, CheckCircle,
  UserPlus, UserMinus, FileText, MessageSquare, Activity,
  ArrowRight, Search, Filter, Clock
} from 'lucide-angular';

export type ActivityFilterType = 'all' | 'tasks' | 'milestones' | 'members' | 'project' | 'documents';

export interface ActivityFilterOption {
  key: ActivityFilterType;
  label: string;
  entityMatch: string;
}

export interface ActivityChange {
  field: string;
  oldValue?: any;
  newValue: any;
}

export interface ParsedActivity {
  id: string;
  rawType: string;
  occurredOn: string;
  actionBy: string | null;
  actorName: string;
  actorInitials: string;
  actorBg: string;
  icon: any;
  iconColorClass: string;
  entityType: string;
  actionName: string;
  entityName: string | null;
  titleHtml: string;
  changes: ActivityChange[];
  searchableText: string;
}

@Component({
  selector: 'app-project-detail-activity-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './project-detail-activity-page.component.html',
})
export class ProjectDetailActivityPageComponent {
  readonly detailService = inject(ProjectDetailService);
  private readonly userApiService = inject(UserApiService);

  // ── Icons ──
  readonly Plus = Plus;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly CheckCircle = CheckCircle;
  readonly UserPlus = UserPlus;
  readonly UserMinus = UserMinus;
  readonly FileText = FileText;
  readonly MessageSquare = MessageSquare;
  readonly ActivityIcon = Activity;
  readonly ArrowRight = ArrowRight;
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly ClockIcon = Clock;

  // ── Filter & Search State ──
  readonly activeFilter = signal<ActivityFilterType>('all');
  readonly searchQuery = signal<string>('');
  readonly isSearchOpen = signal<boolean>(false);

  readonly filterOptions: ActivityFilterOption[] = [
    { key: 'all', label: 'All', entityMatch: '' },
    { key: 'tasks', label: 'Tasks', entityMatch: 'Task' },
    { key: 'milestones', label: 'Milestones', entityMatch: 'Milestone' },
    { key: 'members', label: 'Members', entityMatch: 'Member' },
    { key: 'project', label: 'Project', entityMatch: 'Project' },
    { key: 'documents', label: 'Documents', entityMatch: 'Document' },
  ];

  private readonly userCache = signal<Record<string, { name: string; initials: string; bg: string }>>({});
  private readonly pendingFetches = new Set<string>();

  // Technical fields we don't want to show to users
  private readonly ignoredKeys = new Set([
    'id', 'eventId', 'tenantId', 'projectId', 'taskId', 'milestoneId', 'actionBy',
    'occurredOn', 'payload', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'version'
  ]);

  constructor() {
    effect(() => {
      const project = this.detailService.project();
      if (project) {
        this.detailService.loadActivities(project.id);
      }
    });
  }

  // ── All parsed activities (unfiltered) ──
  private readonly allParsedActivities = computed(() => {
    const activities = this.detailService.activities().map(a => this.parseActivity(a));
    activities.sort((a, b) => new Date(b.occurredOn).getTime() - new Date(a.occurredOn).getTime());
    return activities;
  });

  // ── Total count ──
  readonly totalCount = computed(() => this.allParsedActivities().length);

  // ── Filter counts per entity type ──
  readonly filterCounts = computed(() => {
    const all = this.allParsedActivities();
    const counts: Record<ActivityFilterType, number> = {
      all: all.length,
      tasks: 0,
      milestones: 0,
      members: 0,
      project: 0,
      documents: 0,
    };
    for (const a of all) {
      if (a.entityType === 'Task') counts['tasks']++;
      else if (a.entityType === 'Milestone') counts['milestones']++;
      else if (a.entityType === 'Member') counts['members']++;
      else if (a.entityType === 'Project') counts['project']++;
      else if (a.entityType === 'Document') counts['documents']++;
    }
    return counts;
  });

  // ── Filtered + searched + grouped ──
  readonly groupedActivities = computed(() => {
    let activities = this.allParsedActivities();

    // Apply entity filter
    const filter = this.activeFilter();
    if (filter !== 'all') {
      const option = this.filterOptions.find(f => f.key === filter);
      if (option?.entityMatch) {
        activities = activities.filter(a => a.entityType === option.entityMatch);
      }
    }

    // Apply search
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      activities = activities.filter(a => a.searchableText.includes(query));
    }

    return this.groupByDate(activities);
  });

  // ── Empty state message based on filter ──
  readonly emptyStateMessage = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchQuery().trim();

    if (query) {
      return `No activities matching "${query}"`;
    }

    const messages: Record<ActivityFilterType, string> = {
      all: 'No activity recorded yet',
      tasks: 'No task activity yet',
      milestones: 'No milestone activity yet',
      members: 'No member activity yet',
      project: 'No project-level activity yet',
      documents: 'No document activity yet',
    };
    return messages[filter];
  });

  readonly emptyStateDescription = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchQuery().trim();

    if (query) {
      return 'Try adjusting your search terms or clearing the filter.';
    }

    const descriptions: Record<ActivityFilterType, string> = {
      all: 'When tasks are created, statuses are changed, or members join, they will appear here.',
      tasks: 'Task creation, updates, and status changes will appear here.',
      milestones: 'Milestone events will be logged here as they happen.',
      members: 'Team additions and removals will be tracked here.',
      project: 'Project-level updates and configuration changes appear here.',
      documents: 'Document uploads and changes will be tracked here.',
    };
    return descriptions[filter];
  });

  // ── Helpers ──
  getEntityName(activity: ParsedActivity): string | null {
    return activity.entityName;
  }

  // ── Actions ──
  setFilter(filter: ActivityFilterType): void {
    this.activeFilter.set(filter);
  }

  toggleSearch(): void {
    const opening = !this.isSearchOpen();
    this.isSearchOpen.set(opening);
    if (!opening) {
      this.searchQuery.set('');
    }
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  // ── Grouping ──
  private groupByDate(activities: ParsedActivity[]): { dateLabel: string; activities: ParsedActivity[] }[] {
    const groups: { dateLabel: string; activities: ParsedActivity[] }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const activity of activities) {
      const date = new Date(activity.occurredOn);
      date.setHours(0, 0, 0, 0);

      let label = '';
      if (date.getTime() === today.getTime()) {
        label = 'Today';
      } else if (date.getTime() === yesterday.getTime()) {
        label = 'Yesterday';
      } else {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      let group = groups.find(g => g.dateLabel === label);
      if (!group) {
        group = { dateLabel: label, activities: [] };
        groups.push(group);
      }
      group.activities.push(activity);
    }

    return groups;
  }

  // ── Parsing ──
  private parseActivity(activity: any): ParsedActivity {
    const parsedPayload = this.safeParse(activity.payload);
    const actionBy = parsedPayload?.actionBy || null;

    // Trigger fetch for user
    if (actionBy) this.fetchUser(actionBy);

    const eventClass = activity.type.split('.').pop() || 'UnknownEvent';
    const { entityType, actionName, icon, iconColorClass } = this.analyzeEventType(eventClass);

    // Look up user details
    const actor = actionBy && this.userCache()[actionBy]
      ? this.userCache()[actionBy]
      : { name: actionBy ? 'Loading...' : 'System', initials: 'S', bg: 'var(--color-bg-muted)' };

    // Extract changes
    const changes = this.extractChanges(parsedPayload);

    // Entity name from payload
    const entityName = parsedPayload?.payload?.title || parsedPayload?.payload?.name || parsedPayload?.title || parsedPayload?.name;

    // Build human-friendly title
    let titleHtml = `<span class="font-semibold text-[var(--color-text)]">${actor.name}</span> ${actionName.toLowerCase()} ${entityType.toLowerCase()}`;
    if (entityName) {
      titleHtml = `<span class="font-semibold text-[var(--color-text)]">${actor.name}</span> ${actionName.toLowerCase()} ${entityType.toLowerCase()} <span class="font-medium text-[var(--color-text)]">"${entityName}"</span>`;
    }

    // Build searchable text for filtering
    const searchableText = [actor.name, actionName, entityType, entityName || '']
      .join(' ')
      .toLowerCase();

    return {
      id: activity.id,
      rawType: eventClass,
      occurredOn: activity.occurredOn,
      actionBy,
      actorName: actor.name,
      actorInitials: actor.initials,
      actorBg: actor.bg,
      icon,
      iconColorClass,
      entityType,
      actionName,
      entityName: entityName || null,
      titleHtml,
      changes,
      searchableText,
    };
  }

  private analyzeEventType(eventClass: string): { entityType: string; actionName: string; icon: any; iconColorClass: string } {
    let entityType = 'Record';
    let actionName = 'Updated';
    let icon = this.ActivityIcon;
    let iconColorClass = 'text-[var(--color-text-muted)] bg-[var(--color-bg-muted)] border-[var(--color-border-strong)]';

    if (eventClass.includes('Project')) entityType = 'Project';
    else if (eventClass.includes('Task')) entityType = 'Task';
    else if (eventClass.includes('Milestone')) entityType = 'Milestone';
    else if (eventClass.includes('Member')) entityType = 'Member';
    else if (eventClass.includes('Comment')) entityType = 'Comment';
    else if (eventClass.includes('Document')) entityType = 'Document';

    if (eventClass.includes('Created') || eventClass.includes('Added')) {
      actionName = eventClass.includes('Added') ? 'Added' : 'Created';
      icon = eventClass.includes('Member') ? this.UserPlus : this.Plus;
      iconColorClass = 'text-[var(--color-success)] bg-[var(--color-success-soft)] border-[var(--color-success)]';
    } else if (eventClass.includes('Updated') || eventClass.includes('Changed')) {
      actionName = eventClass.includes('Changed') ? 'Changed status of' : 'Updated';
      icon = eventClass.includes('Status') ? this.CheckCircle : this.Edit2;
      iconColorClass = 'text-[var(--color-primary)] bg-[var(--color-primary-soft)] border-[var(--color-primary)]';
    } else if (eventClass.includes('Deleted') || eventClass.includes('Removed')) {
      actionName = eventClass.includes('Removed') ? 'Removed' : 'Deleted';
      icon = eventClass.includes('Member') ? this.UserMinus : this.Trash2;
      iconColorClass = 'text-[var(--color-danger)] bg-[var(--color-danger-soft)] border-[var(--color-danger)]';
    }

    return { entityType, actionName, icon, iconColorClass };
  }

  private extractChanges(parsed: any): ActivityChange[] {
    if (!parsed) return [];
    const source = parsed.payload && typeof parsed.payload === 'object' ? parsed.payload : parsed;
    const changes: ActivityChange[] = [];

    // Check for paired old/new fields (e.g. oldStatus/newStatus)
    const processedKeys = new Set<string>();

    for (const key of Object.keys(source)) {
      if (this.ignoredKeys.has(key) || key.toLowerCase().endsWith('id')) continue;

      if (key.startsWith('old') && source['new' + key.substring(3)] !== undefined) {
        const baseField = key.substring(3);
        const oldVal = source[key];
        const newVal = source['new' + baseField];

        processedKeys.add(key);
        processedKeys.add('new' + baseField);

        if (this.isUUID(oldVal) || this.isUUID(newVal)) continue;

        changes.push({
          field: this.formatKey(baseField),
          oldValue: oldVal,
          newValue: newVal
        });
      } else if (!processedKeys.has(key)) {
        const val = source[key];
        if (val != null && val !== '' && !this.isUUID(val)) {
          changes.push({
            field: this.formatKey(key),
            newValue: val
          });
        }
      }
    }
    return changes;
  }

  private isUUID(str: any): boolean {
    if (typeof str !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  }

  private safeParse(str: string): any {
    try { return JSON.parse(str); } catch { return null; }
  }

  private fetchUser(userId: string): void {
    if (this.userCache()[userId] || this.pendingFetches.has(userId)) return;
    this.pendingFetches.add(userId);

    setTimeout(() => {
      this.userApiService.getByKeycloakUserId(userId).subscribe({
        next: (res: any) => {
          if (res.data) {
            const firstName = res.data.firstName || '';
            const lastName = res.data.lastName || '';
            const name = `${firstName} ${lastName}`.trim() || userId;
            // Proper initials: first char of first name + first char of last name
            const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || name.substring(0, 2).toUpperCase();

            const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
            let charSum = 0;
            for (let i = 0; i < userId.length; i++) charSum += userId.charCodeAt(i);
            const colorIndex = charSum % colors.length;

            this.userCache.update(cache => ({
              ...cache,
              [userId]: { name, initials, bg: colors[colorIndex] }
            }));
          }
        },
        error: () => {
          this.userCache.update(cache => ({
            ...cache,
            [userId]: { name: 'Unknown User', initials: '?', bg: 'var(--color-bg-muted)' }
          }));
        }
      });
    });
  }

  private formatKey(key: string): string {
    const formatted = key.replace(/([A-Z])/g, ' $1').trim();
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
}
