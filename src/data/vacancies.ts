import type { User, Vacancy, VacancyInput } from '../types';
import { SEED_VACANCIES } from './seed';

const VACANCIES_KEY = 'cargolink.vacancies';

function readPosted(): Vacancy[] {
  try {
    const raw = localStorage.getItem(VACANCIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function listVacancies(): Vacancy[] {
  return [...readPosted(), ...SEED_VACANCIES].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export function listVacanciesByCompany(companyId: string): Vacancy[] {
  return listVacancies().filter((v) => v.companyId === companyId);
}

export function getVacancy(id: string): Vacancy | undefined {
  return listVacancies().find((v) => v.id === id);
}

export function createVacancy(company: User, input: VacancyInput): Vacancy {
  if (company.role !== 'company') throw new Error('Only companies can post vacancies.');
  const vacancy: Vacancy = {
    ...input,
    id: crypto.randomUUID(),
    companyId: company.id,
    companyName: company.companyName ?? company.name,
    postedAt: new Date().toISOString(),
  };
  localStorage.setItem(VACANCIES_KEY, JSON.stringify([vacancy, ...readPosted()]));
  return vacancy;
}
