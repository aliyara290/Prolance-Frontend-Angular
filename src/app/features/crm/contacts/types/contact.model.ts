import { Address } from '../../clients/types/client.model';

export type InfluenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type Role = 'CEO' | 'INFLUENCER' | 'DIRECTOR' | 'BUYER';
export type Department =
  | 'TECHNOLOGY' | 'FINANCE' | 'HEALTHCARE' | 'EDUCATION'
  | 'MANUFACTURING' | 'CONSULTING' | 'MEDIA' | 'REAL_ESTATE'
  | 'TRANSPORTATION' | 'ENERGY' | 'AGRICULTURE' | 'RETAIL' | 'OTHER';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  influenceLevel: InfluenceLevel;
  primary: boolean;
  notes?: string | null;
  clientId?: string;
  lastContactedAt?: string | null;
  department?: string | null;
  dateOfBirth?: string | null;
  secondaryEmail?: string | null;
  address?: Address;
  description?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clientId?: string;
  role: Role;
  influenceLevel: InfluenceLevel;
  primary: boolean;
  notes?: string;
  department?: string;
  dateOfBirth?: string;
  secondaryEmail?: string;
  address?: Address;
  description?: string;
}

export type UpdateContactRequest = CreateContactRequest;

export interface ContactsListMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
