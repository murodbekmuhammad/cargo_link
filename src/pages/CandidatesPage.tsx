import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { listCandidates } from '../auth/storage';
import { PublicLayout } from '../components/PublicLayout';
import { JOB_CATEGORIES } from '../types';
import { timeAgo } from '../utils/format';

export function CandidatesPage() {
  const { user } = useAuth();
  const candidates = useMemo(() => listCandidates(), []);
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = candidates.filter(
    (c) =>
      (!q || [c.displayName, c.location ?? '', c.about ?? ''].some((s) => s.toLowerCase().includes(q))) &&
      (!position || c.desiredPosition === position),
  );

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
      </div>

      <p className="muted small">{filtered.length} candidates</p>
      <div className="list">
        {filtered.map((c) => (
          <div key={c.id} className="card list-card">
            <div className="list-card-head">
              <h3>{c.displayName}</h3>
              <span className="muted small">Joined {timeAgo(c.joinedAt).toLowerCase()}</span>
            </div>
            <p className="company">{c.desiredPosition ?? 'Position not specified'}</p>
            {c.about && <p className="muted">{c.about}</p>}
            <div className="tags">
              {c.location && <span className="tag">📍 {c.location}</span>}
              {c.experienceYears !== undefined && (
                <span className="tag">
                  {c.experienceYears} {c.experienceYears === 1 ? 'year' : 'years'} experience
                </span>
              )}
              {c.licenses.length > 0 && <span className="tag">License: {c.licenses.join(', ')}</span>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="muted">No candidates match your filters.</p>}
      </div>
    </PublicLayout>
  );
}
