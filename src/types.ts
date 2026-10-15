export type Role = 'admin' | 'company' | 'applicant';

export const JOB_CATEGORIES = [
  'Truck driver',
  'Dispatcher',
  'Warehouse',
  'Logistics manager',
  'Mechanic',
  'Forwarder',
  'Other',
] as const;
export type JobCategory = (typeof JOB_CATEGORIES)[number];

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract';
export const EMPLOYMENT_TYPES: EmploymentType[] = ['Full-time', 'Part-time', 'Contract'];

/** A place with coordinates, so lists can be filtered and sorted by distance. */
export interface GeoLocation {
  label: string;
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  role: Role;
  email: string;
  name: string;
  /** Company accounts only. */
  companyName?: string;
  /** Applicant accounts only. */
  phone?: string;
  desiredPosition?: JobCategory;
  experienceYears?: number;
  licenses?: string[];
  about?: string;
  createdAt: string;
}

export interface StoredUser extends User {
  password: string;
}

export interface RegisterInput {
  role: Exclude<Role, 'admin'>;
  email: string;
  password: string;
  name: string;
  companyName?: string;
  phone?: string;
  desiredPosition?: JobCategory;
}

/** What anyone, including guests, may see about an applicant. No contact details. */
export interface PublicCandidate {
  id: string;
  displayName: string;
  desiredPosition?: JobCategory;
  experienceYears?: number;
  licenses: string[];
  about?: string;
  joinedAt: string;
}

export interface Vacancy {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  category: JobCategory;
  location?: GeoLocation;
  /** Unknown for vacancies imported from Telegram. */
  employmentType?: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requirements: string[];
  postedAt: string;
  /** Set when the vacancy was imported from a Telegram channel post rather than posted here. */
  source?: VacancySource;
}

export interface VacancySource {
  kind: 'telegram';
  channel: string;
  url: string;
}

export type VacancyInput = Omit<Vacancy, 'id' | 'companyId' | 'companyName' | 'postedAt' | 'source'>;

export interface Application {
  id: string;
  vacancyId: string;
  applicantId: string;
  status: 'submitted';
  createdAt: string;
}

export const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  company: '/company',
  applicant: '/applicant',
};
