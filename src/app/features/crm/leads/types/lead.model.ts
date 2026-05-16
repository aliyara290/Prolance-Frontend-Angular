export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  owner: string;
  status: LeadStatus;
  createdAt: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost';

export interface LeadsFilter {
  search: string;
  status: LeadStatus | null;
  source: string | null;
}
