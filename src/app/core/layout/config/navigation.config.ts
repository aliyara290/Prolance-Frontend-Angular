import { NavItem } from '../models/nav-item.model';

export const NAVIGATION_CONFIG: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    route: '/app/dashboard',
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: 'goal',
    route: '/app/crm/leads'
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: 'deals',
    route: '/app/crm/deals',
    // roles: ['ADMIN', 'SALES'],
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: 'clients',
    route: '/app/crm/clients',
    // roles: ['ADMIN', 'SALES'],
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: 'contacts',
    route: '/app/crm/contacts',
    // roles: ['ADMIN', 'SALES'],
  },


  {
    id: 'projects',
    label: 'Projects',
    icon: 'projects',
    route: '/app/projects',
  },

  {
    id: 'documents',
    label: 'Documents',
    icon: 'documents',
    route: '/app/documents',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    route: '/app/settings',
    // roles: ['ADMIN']
    children: [
      {
        id: 'personal-settings',
        label: 'Personal settings',
        route: '/app/settings/personal',
      },
      {
        id: 'users-settings',
        label: 'Users',
        route: '/app/settings/users',
      },
      {
        id: 'workspace-settings',
        label: 'Workspace settings',
        route: '/app/settings/workspace',
      }
    ]
  }
];
