export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type ClientType = 'B2B' | 'B2C' | 'ENTERPRISE' | 'STARTUP';
export type Ownership = 'PRIVATE' | 'PUBLIC' | 'GOVERNMENT' | 'PARTNERSHIP' | 'OTHER';

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Client {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: Address;
  status: ClientStatus;
  type: ClientType;
  source: string;
  annualRevenue?: number;
  fax?: string;
  ownership?: Ownership;
  sicCode?: string;
  description?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClientRequest {
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: Address;
  type: ClientType;
  source: string;
  annualRevenue?: number;
  fax?: string;
  ownership?: Ownership;
  sicCode?: string;
  description?: string;
}
