import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { LocationPicker } from '../components/LocationPicker';
import { LocationTag } from '../components/LocationTag';
import { PublicLayout } from '../components/PublicLayout';
import { applyToVacancy, hasApplied } from '../data/applications';
import { getVacancy } from '../data/vacancies';
import type { GeoLocation } from '../types';
import { formatSalary, timeAgo } from '../utils/format';
import { distanceKm } from '../utils/geo';

export function VacancyDetailPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const vacancy = getVacancy(id);
  const [applied, setApplied] = useState(() => (user ? hasApplied(id, user.id) : false));
  const [applyFrom, setApplyFrom] = useState<GeoLocation | undefined>(user?.location);

  if (!vacancy) {
    return (
      <PublicLayout>
        <h1>Vacancy not found</h1>
        <Link to="/vacancies">← Back to vacancies</Link>
      </PublicLayout>
    );
  }

  const distanceFromYou =
    user?.location && vacancy.location ? distanceKm(user.location, vacancy.location) : undefined;
  const here = encodeURIComponent(`/vacancies/${vacancy.id}`);

  let action;
  if (!user) {
    action = (
      <>
        <Link to={`/auth?role=applicant&mode=register&redirect=${here}`} className="primary-btn">
          Sign up to apply
        </Link>
        <p className="muted small">
          Already have an account? <Link to={`/auth?role=applicant&redirect=${here}`}>Sign in</Link>
        </p>
      </>
    );
  } else if (user.role !== 'applicant') {
    action = <p className="muted small">Only applicant accounts can apply to vacancies.</p>;
  } else if (applied) {
    action = (
      <>
        <button type="button" className="primary-btn" disabled>
          ✓ Applied
        </button>
        <p className="muted small">
          Track it in <Link to="/applicant">your dashboard</Link>.
        </p>
      </>
    );
  } else {
    action = (
      <>
        <label className="field">
          <span>
            Your location <span className="muted">(optional)</span>
          </span>
          <LocationPicker
            value={applyFrom}
            onChange={setApplyFrom}
            presets={user.location ? [{ label: `My location — ${user.location.label}`, location: user.location }] : []}
          />
        </label>
        <button
          type="button"
          className="primary-btn"
          onClick={() => {
            applyToVacancy(vacancy.id, user.id, applyFrom);
            setApplied(true);
          }}
        >
          Apply now
        </button>
      </>
    );
  }

  return (
    <PublicLayout>
      <Link to="/vacancies" className="link-btn">
        ← All vacancies
      </Link>
      <div className="detail">
        <article className="card">
          <h1>{vacancy.title}</h1>
          <p className="company">{vacancy.companyName}</p>
          <div className="tags">
            <span className="tag">{vacancy.category}</span>
            {vacancy.location ? (
              <LocationTag location={vacancy.location} distance={distanceFromYou} />
            ) : (
              <span className="tag">Location not specified</span>
            )}
            <span className="tag">{vacancy.employmentType}</span>
          </div>
          <h3>Description</h3>
          <p>{vacancy.description}</p>
          <h3>Requirements</h3>
          <ul>
            {vacancy.requirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </article>
        <aside className="card apply-box">
          <p className="salary">{formatSalary(vacancy)}</p>
          <p className="muted small">Posted {timeAgo(vacancy.postedAt).toLowerCase()}</p>
          {action}
        </aside>
      </div>
    </PublicLayout>
  );
}
