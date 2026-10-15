import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ROLE_HOME } from '../types';

export function PublicLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="topbar-left">
          <Link to="/vacancies" className="brand">
            <img src="/truck.svg" alt="" width={24} height={24} />
            <span>CargoLink</span>
          </Link>
          <nav className="nav">
            <NavLink to="/vacancies">Vacancies</NavLink>
            <NavLink to="/candidates">Candidates</NavLink>
          </nav>
        </div>
        <div className="topbar-right">
          {user ? (
            <Link to={ROLE_HOME[user.role]} className="secondary-btn">
              My dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth" className="nav-link">
                Sign in
              </Link>
              <Link to="/auth?mode=register" className="primary-btn small-btn">
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
