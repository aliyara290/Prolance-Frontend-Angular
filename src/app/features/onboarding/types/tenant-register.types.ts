export enum TenantIndustry {
  TECHNOLOGY = 'TECHNOLOGY',
  FINANCE = 'FINANCE',
  HEALTHCARE = 'HEALTHCARE',
  EDUCATION = 'EDUCATION',
  RETAIL = 'RETAIL',
  MANUFACTURING = 'MANUFACTURING',
  CONSULTING = 'CONSULTING',
  MEDIA = 'MEDIA',
  REAL_ESTATE = 'REAL_ESTATE',
  TRANSPORTATION = 'TRANSPORTATION',
  ENERGY = 'ENERGY',
  AGRICULTURE = 'AGRICULTURE',
  OTHER = 'OTHER'
}

export interface TenantRegisterRequest {
  name: string;
  companyEmail: string;
  website: string;
  industry: TenantIndustry;
}

export interface TenantRegisterResponse {
  success: boolean;
  data: { tenantId: string };
  meta: null;
  timestamp: Date;
}

export const INDUSTRY_OPTIONS: { label: string; value: TenantIndustry }[] = [
  { label: 'Technology', value: TenantIndustry.TECHNOLOGY },
  { label: 'Finance', value: TenantIndustry.FINANCE },
  { label: 'Healthcare', value: TenantIndustry.HEALTHCARE },
  { label: 'Education', value: TenantIndustry.EDUCATION },
  { label: 'Retail', value: TenantIndustry.RETAIL },
  { label: 'Manufacturing', value: TenantIndustry.MANUFACTURING },
  { label: 'Consulting', value: TenantIndustry.CONSULTING },
  { label: 'Media', value: TenantIndustry.MEDIA },
  { label: 'Real Estate', value: TenantIndustry.REAL_ESTATE },
  { label: 'Transportation', value: TenantIndustry.TRANSPORTATION },
  { label: 'Energy', value: TenantIndustry.ENERGY },
  { label: 'Agriculture', value: TenantIndustry.AGRICULTURE },
  { label: 'Other', value: TenantIndustry.OTHER }
];
