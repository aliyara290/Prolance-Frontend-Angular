export interface WorkspaceSettings {
  name: string;
  website: string;
  description: string;
  logo: string;
  size: number;
  foundedDate: string;
  industry: string;
  language: string;
  timezone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

export const TIMEZONES = [
  'UTC-08:00 — Pacific Time (US)',
  'UTC-07:00 — Mountain Time (US)',
  'UTC-06:00 — Central Time (US)',
  'UTC-05:00 — Eastern Time (US)',
  'UTC+00:00 — London, Dublin',
  'UTC+01:00 — Paris, Berlin, Rome',
  'UTC+02:00 — Cairo, Johannesburg',
  'UTC+03:00 — Riyadh, Moscow',
  'UTC+04:00 — Dubai, Baku',
  'UTC+05:30 — Mumbai, Kolkata',
  'UTC+08:00 — Beijing, Singapore',
  'UTC+09:00 — Tokyo, Seoul',
  'UTC+10:00 — Sydney, Melbourne',
];

export const LANGUAGES = [
  'English', 'French', 'Arabic', 'Spanish', 'German',
  'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese',
];

export const INDUSTRIES = [
  'TECHNOLOGY', 'FINANCE', 'HEALTHCARE', 'EDUCATION', 'MANUFACTURING',
  'CONSULTING', 'MEDIA', 'REAL_ESTATE', 'TRANSPORTATION', 'ENERGY',
  'AGRICULTURE', 'RETAIL', 'OTHER',
];
