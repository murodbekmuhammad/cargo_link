import type { Vacancy } from '../types';

export const pluralize = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

const money = (n: number) => `$${n.toLocaleString('en-US')}`;

export function formatSalary(v: Pick<Vacancy, 'salaryMin' | 'salaryMax' | 'source'>): string {
  if (v.salaryMin && v.salaryMin === v.salaryMax) return `${money(v.salaryMin)} / month`;
  if (v.salaryMin && v.salaryMax) return `${money(v.salaryMin)} – ${money(v.salaryMax)} / month`;
  if (v.salaryMin) return `from ${money(v.salaryMin)} / month`;
  if (v.salaryMax) return `up to ${money(v.salaryMax)} / month`;
  // Imported posts often give pay in so'm or in words; the full post text is on the vacancy page.
  return v.source ? 'Salary: see post' : 'Salary negotiable';
}

export function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

/** "Jasur Tursunov" -> "Jasur T." so guests don't see full names. */
export function shortName(name: string): string {
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest[rest.length - 1];
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}
