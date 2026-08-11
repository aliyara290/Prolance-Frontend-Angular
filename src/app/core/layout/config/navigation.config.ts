import { LucideIconData } from 'lucide-angular';
import {
  LayoutDashboard,
  Goal,
  Handshake,
  Building2,
  ContactRound,
  Files,
  ListChecks,
  Clock,
  ReceiptText
} from 'lucide-angular';

export interface CrmNavSection {
  title: string;
  items: CrmNavItem[];
}

export interface CrmNavItem {
  id: string;
  label: string;
  icon: LucideIconData;
  route: string;
  badge?: string;
  roles?: string[];
  hidden?: boolean;
}

export const CRM_NAV_SECTIONS: CrmNavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        route: '/app/crm/dashboard',
      },
    ],
  },
  {
    title: 'CRM',
    items: [
      {
        id: 'leads',
        label: 'Leads',
        icon: Goal,
        route: '/app/crm/leads',
      },
      {
        id: 'deals',
        label: 'Deals',
        icon: Handshake,
        route: '/app/crm/deals',
        // roles: ['ADMIN', 'SALES'],
      },
      {
        id: 'clients',
        label: 'Clients',
        icon: Building2,
        route: '/app/crm/clients',
        // roles: ['ADMIN', 'SALES'],
      },
      {
        id: 'contacts',
        label: 'Contacts',
        icon: ContactRound,
        route: '/app/crm/contacts',
        // roles: ['ADMIN', 'SALES'],
      },
    ],
  },
  {
    title: 'PROJECT MANAGEMENT',
    items: [
      {
        id: 'tasks',
        label: 'Tasks',
        icon: ListChecks,
        route: '/app/projects/tasks',
      },
    ],
  },
  {
    title: 'BILLING & TIME',
    items: [
      {
        id: 'time-tracking',
        label: 'Time Tracker',
        icon: Clock,
        route: '/app/billing/time-tracking',
      },
      {
        id: 'invoices',
        label: 'Invoices',
        icon: ReceiptText,
        route: '/app/billing/invoices',
      },
    ],
  },
  {
    title: 'RESOURCES',
    items: [
      {
        id: 'documents',
        label: 'Documents',
        icon: Files,
        route: '/app/documents',
      },
    ],
  },
];
