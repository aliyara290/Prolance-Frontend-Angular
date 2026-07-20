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
    },
    // {
    //   id: 'users',
    //   label: 'Users',
    //   icon: Users,
    //   route: '/app/settings/users',
    // },
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
    },
    // {
    //   id: 'issues',
    //   label: 'Issues',
    //   icon: AlertCircle,
    //   route: '/app/projects/issues',
    // },
    {
      id: 'milestones',
      label: 'Milestones',
      icon: Flag,
      route: '/app/projects/milestones',
    },
    {
      id: 'docs',
      label: 'Documents',
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

