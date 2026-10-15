import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { LocationTag } from '../components/LocationTag';
import { PublicLayout } from '../components/PublicLayout';
import { VacancyMap } from '../components/VacancyMap';
import { applyToVacancy, hasApplied } from '../data/applications';
import { getVacancy } from '../data/vacancies';
import { formatSalary, timeAgo } from '../utils/format';

export function VacancyDetailPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const vacancy = getVacancy(id);
  const [applied, setApplied] = useState(() => (user ? hasApplied(id, user.id) : false));

  if (!vacancy) {
    return (
      <PublicLayout>
        <h1>Vacancy not found</h1>
        <Link to="/vacancies">← Back to vacancies</Link>
      </PublicLayout>
    );
  }

  const here = encodeURIComponent(`/vacancies/${vacancy.id}`);

  let action;
  if (vacancy.source) {
    // Imported posts: the employer isn't on CargoLink, so applying happens in Telegram.
    action = (
      <>
        <a href={vacancy.source.url} target="_blank" rel="noopener noreferrer" className="primary-btn">
          Open post in Telegram
        </a>
        <p className="muted small">
          Imported from the Telegram channel <strong>{vacancy.source.channel}</strong>. Contact the employer using
          the details in the post.
        </p>
      </>
    );
  } else if (!user) {
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
      <button
        type="button"
        className="primary-btn"
        onClick={() => {
          applyToVacancy(vacancy.id, user.id);
          setApplied(true);
        }}
      >
        Apply now
      </button>
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
              <LocationTag location={vacancy.location} />
            ) : (
              <span className="tag">Location not specified</span>
            )}
            {vacancy.employmentType && <span className="tag">{vacancy.employmentType}</span>}
          </div>
          <h3>Description</h3>
          <p className="description">{vacancy.description}</p>
          {vacancy.requirements.length > 0 && (
            <>
              <h3>Requirements</h3>
              <ul>
                {vacancy.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </>
          )}
        </article>
        <aside className="card apply-box">
          <p className="salary">{formatSalary(vacancy)}</p>
          <p className="muted small">Posted {timeAgo(vacancy.postedAt).toLowerCase()}</p>
          {action}
        </aside>
        {vacancy.location && (
          <section className="card detail-map">
            <h3>Location</h3>
            <p className="muted small">📍 {vacancy.location.label}</p>
            <VacancyMap vacancies={[{ item: vacancy }]} height={280} showLinks={false} />
          </section>
        )}
      </div>
    </PublicLayout>
  );
}
