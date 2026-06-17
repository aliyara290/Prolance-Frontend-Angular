import { LucideIconData } from 'lucide-angular';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  AlertCircle,
  Flag,
  TrendingUp,
  FileText,
} from 'lucide-angular';

export interface ProjectNavSection {
  title: string;
  showAction?: boolean;
  items: ProjectNavItem[];
}

export interface ProjectNavItem {
  id: string;
  label: string;
  icon?: LucideIconData;
  route?: string;
  badge?: string;
  badgeType?: 'default' | 'accent';
  color?: string;
}

export const PROJECT_OVERVIEW_NAV: ProjectNavSection = {
  title: 'GLOBAL OVERVIEW',
  items: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      route: '/app/projects/dashboard',
    },
    {
      id: 'all-projects',
      label: 'All projects',
      icon: FolderKanban,
      route: '/app/projects/all',
      badge: '8',
    },
    {
      id: 'members',
      label: 'Members',
      icon: Users,
      route: '/app/projects/members',
      badge: '12',
    },
  ],
};

export const PROJECT_CURRENT_NAV: ProjectNavSection = {
  title: 'PROJECTS OVERVIEW',
  items: [
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      route: '/app/projects/tasks',
      badge: '24',
    },
    {
      id: 'issues',
      label: 'Issues',
      icon: AlertCircle,
      route: '/app/projects/issues',
      badge: '5',
      badgeType: 'accent',
    },
    {
      id: 'milestones',
      label: 'Milestones',
      icon: Flag,
      route: '/app/projects/milestones',
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: TrendingUp,
      route: '/app/projects/timeline',
    },
    {
      id: 'docs',
      label: 'Docs',
      icon: FileText,
      route: '/app/projects/docs',
    },
  ],
};

export interface RecentProject {
  id: string;
  name: string;
  color: string;
}

export const RECENT_PROJECTS_MOCK: RecentProject[] = [
  { id: '1', name: 'Scorlift', color: '#7c5cfc' },
  { id: '2', name: 'Website Development', color: '#22c55e' },
  { id: '3', name: 'Product Launch Plan', color: '#ef4444' },
  { id: '4', name: 'Mobile App v2', color: '#3b82f6' },
  { id: '5', name: 'Q3 Marketing', color: '#f59e0b' },
];

