export type Stage = 'PROSPECTING' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type OpportunityType = 'NEW_BUSINESS' | 'EXISTING_BUSINESS';
export type Source = 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'COLD_CALL' | 'EVENT' | 'OTHER';

export interface Deal {
  id: string;
  clientId: string;
  title: string;
  description?: string | null;
  amount?: number | null;
  stage: Stage;
  priority: Priority;
  estimatedBudget?: number | null;
  expectedRevenue?: number | null;
  probability?: number | null;
  expectedStartDate?: string | null;
  expectedEndDate?: string | null;
  lastActivityAt?: string | null;
  nextFollowUpAt?: string | null;
  closingDate?: string | null;
  lostReason?: string | null;
  type?: OpportunityType | null;
  source: Source;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDealRequest {
  clientId: string;
  title: string;
  description?: string;
  estimatedBudget?: number;
  expectedRevenue?: number;
  probability?: number;
  stage: Stage;
  expectedStartDate?: string;
  expectedEndDate?: string;
  priority: Priority;
  type?: OpportunityType;
  source: Source;
}

export interface UpdateDealRequest extends CreateDealRequest {
  lastActivityAt?: string | null;
  nextFollowUpAt?: string | null;
  closingDate?: string | null;
  lostReason?: string | null;
}

export interface DealsListMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
