import { JOB_CATEGORIES, type User, type Vacancy, type VacancyInput } from '../types';
import { cityLocation } from './cities';
import { SEED_VACANCIES } from './seed';

const VACANCIES_KEY = 'cargolink.vacancies';

/** Written every hour by scripts/telegram/sync.mjs (see .github/workflows/telegram-sync.yml). */
const TELEGRAM_FEED = `${import.meta.env.BASE_URL}data/telegram-vacancies.json`;

type ImportedVacancy = Omit<Vacancy, 'location'> & { city?: string };

let imported: Vacancy[] = [];

/** Loads vacancies imported from Telegram. Call once before rendering; the site still works if it fails. */
export async function loadImportedVacancies(): Promise<void> {
  try {
    const res = await fetch(TELEGRAM_FEED, { cache: 'no-cache' });
    if (!res.ok) return;
    const feed: { vacancies?: ImportedVacancy[] } = await res.json();
    imported = (feed.vacancies ?? [])
      .filter((v) => v.source?.url.startsWith('https://t.me/'))
      .map(({ city, ...v }) => ({
        ...v,
        category: JOB_CATEGORIES.includes(v.category) ? v.category : 'Other',
        location: city ? cityLocation(city) : undefined,
      }));
  } catch {
    imported = [];
  }
}

function readPosted(): Vacancy[] {
  try {
    const raw = localStorage.getItem(VACANCIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function listVacancies(): Vacancy[] {
  return [...readPosted(), ...imported, ...SEED_VACANCIES].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
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
