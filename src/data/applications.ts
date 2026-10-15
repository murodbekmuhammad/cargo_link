import type { Application } from '../types';

const APPLICATIONS_KEY = 'cargolink.applications';

function read(): Application[] {
  try {
    const raw = localStorage.getItem(APPLICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function listApplicationsByApplicant(applicantId: string): Application[] {
  return read()
    .filter((a) => a.applicantId === applicantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function hasApplied(vacancyId: string, applicantId: string): boolean {
  return read().some((a) => a.vacancyId === vacancyId && a.applicantId === applicantId);
}

export function applyToVacancy(vacancyId: string, applicantId: string): Application {
  const all = read();
  const existing = all.find((a) => a.vacancyId === vacancyId && a.applicantId === applicantId);
  if (existing) return existing;
  const application: Application = {
    id: crypto.randomUUID(),
    vacancyId,
    applicantId,
    status: 'submitted',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify([...all, application]));
  return application;
}

export function countApplications(vacancyId: string): number {
  return read().filter((a) => a.vacancyId === vacancyId).length;
}
