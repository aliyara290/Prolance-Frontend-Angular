import { Address } from '../../clients/types/client.model';

export type InfluenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type Role = 'CEO' | 'INFLUENCER' | 'DIRECTOR' | 'BUYER';

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
  department?: string;
  dateOfBirth?: string;
  secondaryEmail?: string;
  address?: Address;
  description?: string;
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
