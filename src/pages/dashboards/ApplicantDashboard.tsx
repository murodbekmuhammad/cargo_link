import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { DashboardLayout, Placeholder } from '../../components/DashboardLayout';
import { listApplicationsByApplicant } from '../../data/applications';
import { getVacancy } from '../../data/vacancies';
import { timeAgo } from '../../utils/format';
import { distanceKm } from '../../utils/geo';

export function ApplicantDashboard() {
  const { user } = useAuth();
  const applications = user ? listApplicationsByApplicant(user.id) : [];

  return (
    <DashboardLayout title="Applicant dashboard">
      <section className="card">
        <h3>My applications</h3>
        {applications.length === 0 ? (
          <p className="muted">
            You haven't applied anywhere yet. <Link to="/vacancies">Browse vacancies</Link>
          </p>
        ) : (
          <ul className="plain-list">
            {applications.map((a) => {
              const v = getVacancy(a.vacancyId);
              return (
                <li key={a.id}>
                  <div>
                    <Link to={`/vacancies/${a.vacancyId}`}>{v?.title ?? 'Removed vacancy'}</Link>
                    <span className="muted small"> · {v?.companyName}</span>
                    {a.location && (
                      <div className="muted small">
                        Your location: {a.location.label}
                        {v?.location && ` · ${Math.round(distanceKm(a.location, v.location))} km from the job`}
                      </div>
                    )}
                  </div>
                  <span className="muted small">
                    Submitted {timeAgo(a.createdAt).toLowerCase()} <span className="tag">Submitted</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <Placeholder
        items={[
          { title: 'My profile', text: 'Experience, driver license categories, documents and resume.' },
          { title: 'Job alerts', text: 'Get notified when matching vacancies are posted.' },
        ]}
      />
    </DashboardLayout>
  );
}
