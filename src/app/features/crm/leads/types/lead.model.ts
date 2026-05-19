import { Address, CreateClientRequest } from '../../clients/types/client.model';
import { CreateContactRequest } from '../../contacts/types/contact.model';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Source = 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'COLD_CALL' | 'EVENT' | 'OTHER';

export interface Lead {
  id: string;
  title: string;
  description?: string;
  source: Source;
  priority: Priority;
  status: LeadStatus;
  clientId?: string;
  contactId?: string;
  assignedTo?: string;
  phone?: string | null;
  industry?: string;
  annualRevenue?: number;
  company?: string;
  email?: string;
  website?: string;
  numberOfEmployees?: number;
  address?: Address;
  createdBy?: string;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLeadRequest {
  title: string;
  description?: string;
  source: Source;
  priority: Priority;
  clientId?: string;
  contactId?: string;
  contact?: CreateContactRequest;
  client?: CreateClientRequest;
  industry?: string;
  annualRevenue?: number;
  company?: string;
  email?: string;
  website?: string;
  numberOfEmployees?: number;
  address?: Address;
  assignedTo?: string;
}

export interface LeadsFilter {
  search: string;
  status: LeadStatus | null;
  source: Source | null;
}
