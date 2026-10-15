import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { listVacancies } from '../data/vacancies';
import { JOB_CATEGORIES } from '../types';
import { formatSalary, timeAgo } from '../utils/format';

export function VacanciesPage() {
  const vacancies = useMemo(() => listVacancies(), []);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  const locations = useMemo(() => [...new Set(vacancies.map((v) => v.location))].sort(), [vacancies]);
  const q = query.trim().toLowerCase();
  const filtered = vacancies.filter(
    (v) =>
      (!q || [v.title, v.companyName, v.location, v.description].some((s) => s.toLowerCase().includes(q))) &&
      (!category || v.category === category) &&
      (!location || v.location === location),
  );

  return (
    <PublicLayout>
      <h1>Logistics vacancies</h1>
      <p className="muted">Browse open positions. Create a free account to apply.</p>

      <div className="filters">
        <input
          type="search"
          placeholder="Search by title, company or city"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search vacancies"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {JOB_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Location">
          <option value="">All locations</option>
          {locations.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </div>

      <p className="muted small">{filtered.length} vacancies</p>
      <div className="list">
        {filtered.map((v) => (
          <Link key={v.id} to={`/vacancies/${v.id}`} className="card list-card">
            <div className="list-card-head">
              <h3>{v.title}</h3>
              <span className="muted small">{timeAgo(v.postedAt)}</span>
            </div>
            <p className="company">{v.companyName}</p>
            <p className="salary">{formatSalary(v)}</p>
            <div className="tags">
              <span className="tag">{v.category}</span>
              <span className="tag">📍 {v.location}</span>
              <span className="tag">{v.employmentType}</span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && <p className="muted">No vacancies match your filters.</p>}
      </div>
    </PublicLayout>
  );
}
