import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { DashboardLayout } from '../../components/DashboardLayout';
import { LocationPicker } from '../../components/LocationPicker';
import { LocationTag } from '../../components/LocationTag';
import { countApplications } from '../../data/applications';
import { createVacancy, listVacanciesByCompany } from '../../data/vacancies';
import { EMPLOYMENT_TYPES, JOB_CATEGORIES, type EmploymentType, type GeoLocation, type JobCategory } from '../../types';
import { formatSalary, pluralize, timeAgo } from '../../utils/format';

const EMPTY_FORM = {
  title: '',
  category: JOB_CATEGORIES[0] as JobCategory,
  employmentType: 'Full-time' as EmploymentType,
  salaryMin: '',
  salaryMax: '',
  description: '',
  requirements: '',
};

export function CompanyDashboard() {
  const { user } = useAuth();
  const [vacancies, setVacancies] = useState(() => (user ? listVacanciesByCompany(user.id) : []));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [location, setLocation] = useState<GeoLocation>();
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const salaryMin = form.salaryMin ? Number(form.salaryMin) : undefined;
    const salaryMax = form.salaryMax ? Number(form.salaryMax) : undefined;
    if (salaryMin && salaryMax && salaryMin > salaryMax) {
      setError('Minimum salary cannot be higher than maximum salary.');
      return;
    }
    createVacancy(user, {
      title: form.title.trim(),
      category: form.category,
      employmentType: form.employmentType,
      location,
      salaryMin,
      salaryMax,
      description: form.description.trim(),
      requirements: form.requirements
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
    });
    setVacancies(listVacanciesByCompany(user.id));
    setForm(EMPTY_FORM);
    setLocation(undefined);
    setError(null);
    setShowForm(false);
  };

  return (
    <DashboardLayout title="Company dashboard">
      <section className="card">
        <div className="list-card-head">
          <h3>My vacancies</h3>
          {!showForm && (
            <button type="button" className="primary-btn small-btn" onClick={() => setShowForm(true)}>
              + Post a vacancy
            </button>
          )}
        </div>

        {showForm && (
          <form className="auth-form vacancy-form" onSubmit={onSubmit}>
            <label>
              Job title
              <input required value={form.title} onChange={set('title')} placeholder="e.g. Long-haul truck driver (CE)" />
            </label>
            <div className="form-row">
              <label>
                Category
                <select value={form.category} onChange={set('category')}>
                  {JOB_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Employment type
                <select value={form.employmentType} onChange={set('employmentType')}>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span>
                Location <span className="muted">(optional — lets nearby applicants find this job)</span>
              </span>
              <LocationPicker value={location} onChange={setLocation} />
            </label>
            <div className="form-row">
              <label>
                <span>
                  Salary from, USD/month <span className="muted">(optional)</span>
                </span>
                <input type="number" min={0} value={form.salaryMin} onChange={set('salaryMin')} />
              </label>
              <label>
                <span>
                  Salary to, USD/month <span className="muted">(optional)</span>
                </span>
                <input type="number" min={0} value={form.salaryMax} onChange={set('salaryMax')} />
              </label>
            </div>
            <label>
              Description
              <textarea required rows={4} value={form.description} onChange={set('description')} />
            </label>
            <label>
              <span>
                Requirements <span className="muted">(one per line)</span>
              </span>
              <textarea rows={3} value={form.requirements} onChange={set('requirements')} />
            </label>
            {error && <p className="error" role="alert">{error}</p>}
            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-btn">
                Publish vacancy
              </button>
            </div>
          </form>
        )}

        {vacancies.length === 0 && !showForm ? (
          <p className="muted">You haven't posted any vacancies yet.</p>
        ) : (
          <ul className="plain-list">
            {vacancies.map((v) => (
              <li key={v.id}>
                <div>
                  <Link to={`/vacancies/${v.id}`}>{v.title}</Link>
                  <div className="tags">
                    <LocationTag location={v.location} />
                    <span className="tag">{formatSalary(v)}</span>
                  </div>
                </div>
                <span className="muted small">
                  Posted {timeAgo(v.postedAt).toLowerCase()} · {pluralize(countApplications(v.id), 'application')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DashboardLayout>
  );
}
