import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { JOB_CATEGORIES, ROLE_HOME, type JobCategory, type Role } from '../types';

const ROLES: { value: Role; title: string; description: string; icon: string }[] = [
  {
    value: 'applicant',
    title: 'Applicant',
    description: 'Drivers, dispatchers, warehouse staff — find logistics jobs and apply.',
    icon: '🧑‍✈️',
  },
  {
    value: 'company',
    title: 'Company',
    description: 'Carriers, freight forwarders, 3PLs — post vacancies and hire talent.',
    icon: '🏢',
  },
  {
    value: 'admin',
    title: 'Admin',
    description: 'Platform administrators — moderate companies, jobs and users.',
    icon: '🛡️',
  },
];

type Mode = 'login' | 'register';

const isRole = (v: string | null): v is Role => v === 'admin' || v === 'company' || v === 'applicant';

/** Only allow same-app paths, never "//evil.com" or absolute URLs. */
function safeRedirect(v: string | null): string | null {
  return v && v.startsWith('/') && !v.startsWith('//') ? v : null;
}

export function AuthPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get('redirect'));
  const [role, setRole] = useState<Role | null>(() => {
    const r = params.get('role');
    return isRole(r) ? r : null;
  });
  const [mode, setMode] = useState<Mode>(params.get('mode') === 'register' ? 'register' : 'login');
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    companyName: '',
    phone: '',
    desiredPosition: '',
    location: '',
    email: '',
    password: '',
    confirm: '',
  });

  if (user) return <Navigate to={redirect ?? ROLE_HOME[user.role]} replace />;

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const chooseRole = (r: Role) => {
    setRole(r);
    if (r === 'admin') setMode('login');
    setError(null);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setError(null);
    try {
      let u;
      if (mode === 'login' || role === 'admin') {
        u = login(role, form.email, form.password);
      } else {
        if (form.password.length < 6) throw new Error('Password must be at least 6 characters.');
        if (form.password !== form.confirm) throw new Error('Passwords do not match.');
        u = register({
          role,
          email: form.email,
          password: form.password,
          name: form.name,
          companyName: role === 'company' ? form.companyName.trim() : undefined,
          phone: role === 'applicant' ? form.phone.trim() : undefined,
          desiredPosition:
            role === 'applicant' && form.desiredPosition ? (form.desiredPosition as JobCategory) : undefined,
          location: role === 'applicant' ? form.location.trim() || undefined : undefined,
        });
      }
      navigate(redirect ?? ROLE_HOME[u.role], { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  const selected = ROLES.find((r) => r.value === role);
  const isRegister = mode === 'register' && role !== 'admin';

  return (
    <div className="auth-page">
      <aside className="auth-hero">
        <div className="brand">
          <img src="/truck.svg" alt="" width={32} height={32} />
          <span>CargoLink</span>
        </div>
        <h1>Hiring for the people who keep freight moving.</h1>
        <p>Connect logistics companies with drivers, dispatchers and warehouse professionals.</p>
        <Link to="/vacancies" className="hero-link">
          Browse vacancies without an account →
        </Link>
      </aside>

      <main className="auth-panel">
        {!selected ? (
          <section>
            <h2>Who are you?</h2>
            <p className="muted">Select your role to continue.</p>
            <div className="role-grid">
              {ROLES.map((r) => (
                <button key={r.value} type="button" className="role-card" onClick={() => chooseRole(r.value)}>
                  <span className="role-icon" aria-hidden>{r.icon}</span>
                  <span className="role-title">{r.title}</span>
                  <span className="role-desc">{r.description}</span>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section>
            <button type="button" className="link-btn" onClick={() => setRole(null)}>
              ← Change role
            </button>
            <h2>
              <span aria-hidden>{selected.icon}</span> {selected.title} {isRegister ? 'sign up' : 'sign in'}
            </h2>

            {redirect?.startsWith('/vacancies/') && role !== 'admin' && (
              <p className="notice">Sign in or create an applicant account to apply for this vacancy.</p>
            )}

            {role !== 'admin' && (
              <div className="tabs" role="tablist">
                {(['login', 'register'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    className={mode === m ? 'tab active' : 'tab'}
                    onClick={() => {
                      setMode(m);
                      setError(null);
                    }}
                  >
                    {m === 'login' ? 'Sign in' : 'Create account'}
                  </button>
                ))}
              </div>
            )}

            <form className="auth-form" onSubmit={onSubmit}>
              {isRegister && (
                <label>
                  {role === 'company' ? 'Contact person' : 'Full name'}
                  <input required value={form.name} onChange={update('name')} autoComplete="name" />
                </label>
              )}
              {isRegister && role === 'company' && (
                <label>
                  Company name
                  <input required value={form.companyName} onChange={update('companyName')} autoComplete="organization" />
                </label>
              )}
              {isRegister && role === 'applicant' && (
                <label>
                  Phone
                  <input type="tel" required value={form.phone} onChange={update('phone')} autoComplete="tel" />
                </label>
              )}
              {isRegister && role === 'applicant' && (
                <div className="form-row">
                  <label>
                    Desired position
                    <select value={form.desiredPosition} onChange={update('desiredPosition')}>
                      <option value="">Not specified</option>
                      {JOB_CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    City
                    <input value={form.location} onChange={update('location')} autoComplete="address-level2" />
                  </label>
                </div>
              )}
              <label>
                Email
                <input type="email" required value={form.email} onChange={update('email')} autoComplete="email" />
              </label>
              <label>
                Password
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={update('password')}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
              </label>
              {isRegister && (
                <label>
                  Confirm password
                  <input type="password" required value={form.confirm} onChange={update('confirm')} autoComplete="new-password" />
                </label>
              )}

              {error && <p className="error" role="alert">{error}</p>}

              <button type="submit" className="primary-btn">
                {isRegister ? 'Create account' : 'Sign in'}
              </button>

              {role === 'admin' && (
                <p className="muted small">
                  Admin accounts are provisioned by the platform. Demo: <code>admin@cargolink.com</code> / <code>admin123</code>
                </p>
              )}
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
