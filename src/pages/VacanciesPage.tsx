import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LocationTag } from '../components/LocationTag';
import { NearFilter } from '../components/NearFilter';
import { PublicLayout } from '../components/PublicLayout';
import { listVacancies } from '../data/vacancies';
import { JOB_CATEGORIES, type GeoLocation } from '../types';
import { formatSalary, timeAgo } from '../utils/format';
import { nearby } from '../utils/geo';

export function VacanciesPage() {
  const vacancies = useMemo(() => listVacancies(), []);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [origin, setOrigin] = useState<GeoLocation>();
  const [radiusKm, setRadiusKm] = useState<number | null>(null);

  const q = query.trim().toLowerCase();
  const matching = vacancies.filter(
    (v) =>
      (!q ||
        [v.title, v.companyName, v.location?.label ?? '', v.description].some((s) => s.toLowerCase().includes(q))) &&
      (!category || v.category === category),
  );
  const results = nearby(matching, (v) => v.location, origin, radiusKm);

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
        <NearFilter origin={origin} onOriginChange={setOrigin} radiusKm={radiusKm} onRadiusChange={setRadiusKm} />
      </div>

      <p className="muted small">
        {results.length} vacancies{origin && ` · sorted by distance from ${origin.label}`}
      </p>
      <div className="list">
        {results.map(({ item: v, distance }) => (
          <Link key={v.id} to={`/vacancies/${v.id}`} className="card list-card">
            <div className="list-card-head">
              <h3>{v.title}</h3>
              <span className="muted small">{timeAgo(v.postedAt)}</span>
            </div>
            <p className="company">{v.companyName}</p>
            <p className="salary">{formatSalary(v)}</p>
            <div className="tags">
              <span className="tag">{v.category}</span>
              <LocationTag location={v.location} distance={distance} />
              <span className="tag">{v.employmentType}</span>
            </div>
          </Link>
        ))}
        {results.length === 0 && <p className="muted">No vacancies match your filters.</p>}
      </div>
    </PublicLayout>
  );
}
