import { SeniorityLevel, EducationLevel } from './billing.enums';
import { ApiResponse } from './invoice.types';

// ─── Bill Rate Requests ───

export interface CreateBillRateRequest {
  projectId: string;
  userId: string;
  seniorityLevel: SeniorityLevel;
  educationLevel: EducationLevel;
  hourlyRate: number;
  dailyRate?: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface UpdateBillRateRequest {
  seniorityLevel?: SeniorityLevel;
  educationLevel?: EducationLevel;
  hourlyRate?: number;
  dailyRate?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

// ─── Bill Rate Responses ───

export interface BillRateResponse {
  id: string;
  projectId: string;
  userId: string;
  seniorityLevel: SeniorityLevel;
  educationLevel: EducationLevel;
  hourlyRate: number;
  dailyRate?: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  createdBy: string;
  createdAt: string;
}

export type BillRateApiResponse = ApiResponse<BillRateResponse>;
export type BillRateListApiResponse = ApiResponse<BillRateResponse[]>;
