import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { listCandidates } from '../auth/storage';
import { LocationTag } from '../components/LocationTag';
import { NearFilter } from '../components/NearFilter';
import { PublicLayout } from '../components/PublicLayout';
import { JOB_CATEGORIES, type GeoLocation } from '../types';
import { timeAgo } from '../utils/format';
import { nearby } from '../utils/geo';

export function CandidatesPage() {
  const { user } = useAuth();
  const candidates = useMemo(() => listCandidates(), []);
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState('');
  const [origin, setOrigin] = useState<GeoLocation>();
  const [radiusKm, setRadiusKm] = useState<number | null>(null);

  const q = query.trim().toLowerCase();
  const matching = candidates.filter(
    (c) =>
      (!q ||
        [c.displayName, c.location?.label ?? '', c.about ?? ''].some((s) => s.toLowerCase().includes(q))) &&
      (!position || c.desiredPosition === position),
  );
  const results = nearby(matching, (c) => c.location, origin, radiusKm);

  return (
    <PublicLayout>
      <h1>Candidates</h1>
      <p className="muted">
        Logistics professionals looking for work. Contact details are hidden.
        {!user && (
          <>
            {' '}
            <Link to="/auth?role=company&mode=register">Register as a company</Link> to start hiring.
          </>
        )}
      </p>

      <div className="filters">
        <input
          type="search"
          placeholder="Search by name, city or skills"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search candidates"
        />
        <select value={position} onChange={(e) => setPosition(e.target.value)} aria-label="Desired position">
          <option value="">All positions</option>
          {JOB_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <NearFilter origin={origin} onOriginChange={setOrigin} radiusKm={radiusKm} onRadiusChange={setRadiusKm} />
      </div>

      <p className="muted small">
        {results.length} candidates{origin && ` · sorted by distance from ${origin.label}`}
      </p>
      <div className="list">
        {results.map(({ item: c, distance }) => (
          <div key={c.id} className="card list-card">
            <div className="list-card-head">
              <h3>{c.displayName}</h3>
              <span className="muted small">Joined {timeAgo(c.joinedAt).toLowerCase()}</span>
            </div>
            <p className="company">{c.desiredPosition ?? 'Position not specified'}</p>
            {c.about && <p className="muted">{c.about}</p>}
            <div className="tags">
              <LocationTag location={c.location} distance={distance} />
              {c.experienceYears !== undefined && (
                <span className="tag">
                  {c.experienceYears} {c.experienceYears === 1 ? 'year' : 'years'} experience
                </span>
              )}
              {c.licenses.length > 0 && <span className="tag">License: {c.licenses.join(', ')}</span>}
            </div>
          </div>
        ))}
        {results.length === 0 && <p className="muted">No candidates match your filters.</p>}
      </div>
    </PublicLayout>
  );
}
