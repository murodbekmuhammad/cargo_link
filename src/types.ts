export type Role = 'admin' | 'company' | 'applicant';

export interface User {
  id: string;
  role: Role;
  email: string;
  name: string;
  /** Company accounts only. */
  companyName?: string;
  /** Applicant accounts only. */
  phone?: string;
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
}

export const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  company: '/company',
  applicant: '/applicant',
};
