import type { Vacancy } from '../types';
import { SEED_VACANCIES } from './seed';

// Vacancies are read-only until companies can post them.
export function listVacancies(): Vacancy[] {
  return [...SEED_VACANCIES].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export function getVacancy(id: string): Vacancy | undefined {
  return SEED_VACANCIES.find((v) => v.id === id);
}
