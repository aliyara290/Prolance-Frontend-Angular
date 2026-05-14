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
    route: '/app/leads',
    // roles: ['ADMIN', 'SALES'],
    // children: [
    //   { id: 'crm-leads', label: 'Leads', route: '/crm/leads', badge: '12' },
    //   { id: 'crm-opportunities', label: 'Opportunities', route: '/crm/opportunities' },
    //   { id: 'crm-clients', label: 'Clients', route: '/crm/clients' },
    // ]
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: 'deals',
    route: '/app/deals',
    // roles: ['ADMIN', 'SALES'],
    // children: [
    //   { id: 'crm-leads', label: 'Leads', route: '/crm/leads', badge: '12' },
    //   { id: 'crm-opportunities', label: 'Opportunities', route: '/crm/opportunities' },
    //   { id: 'crm-clients', label: 'Clients', route: '/crm/clients' },
    // ]
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: 'clients',
    route: '/app/clients',
    // roles: ['ADMIN', 'SALES'],
    // children: [
    //   { id: 'crm-leads', label: 'Leads', route: '/crm/leads', badge: '12' },
    //   { id: 'crm-opportunities', label: 'Opportunities', route: '/crm/opportunities' },
    //   { id: 'crm-clients', label: 'Clients', route: '/crm/clients' },
    // ]
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: 'contacts',
    route: '/app/contacts',
    // roles: ['ADMIN', 'SALES'],
    // children: [
    //   { id: 'crm-leads', label: 'Leads', route: '/crm/leads', badge: '12' },
    //   { id: 'crm-opportunities', label: 'Opportunities', route: '/crm/opportunities' },
    //   { id: 'crm-clients', label: 'Clients', route: '/crm/clients' },
    // ]
  },


  {
    id: 'projects',
    label: 'Projects',
    icon: 'projects',
    route: '/app/projects',
    // children: [
    //   { id: 'projects-all', label: 'All Projects', route: '/projects/all' },
    //   { id: 'projects-board', label: 'Kanban Board', route: '/projects/board' },
    // ]
  },

  {
    id: 'documents',
    label: 'Documents',
    icon: 'documents',
    route: '/app/documents',
    // children: [
    //   { id: 'projects-all', label: 'All Projects', route: '/projects/all' },
    //   { id: 'projects-board', label: 'Kanban Board', route: '/projects/board' },
    // ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    route: '/app/settings',
    // roles: ['ADMIN']
  }
];
