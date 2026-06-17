export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type ClientType = 'B2B' | 'B2C' | 'ENTERPRISE' | 'STARTUP';
export type Ownership = 'PRIVATE' | 'PUBLIC' | 'GOVERNMENT' | 'PARTNERSHIP' | 'OTHER';
export type ClientSource = 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'COLD_CALL' | 'EVENT' | 'OTHER';

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
  country?: string;
  status: ClientStatus;
  type: ClientType;
  source: ClientSource;
  annualRevenue?: number;
  fax?: string;
  ownership?: Ownership;
  sicCode?: string | null;
  description?: string | null;
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
  source: ClientSource;
  annualRevenue?: number;
  fax?: string;
  ownership?: Ownership;
  sicCode?: string;
  description?: string;
}

export type UpdateClientRequest = CreateClientRequest;

export interface ClientsListMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
