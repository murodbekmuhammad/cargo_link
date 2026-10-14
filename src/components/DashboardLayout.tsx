import type { ReactNode } from 'react';
import { useAuth } from '../auth/useAuth';

export function DashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="brand">
          <img src="/truck.svg" alt="" width={24} height={24} />
          <span>CargoLink</span>
          <span className="role-badge">{user?.role}</span>
        </div>
        <div className="topbar-right">
          <span className="muted">{user?.companyName ?? user?.name}</span>
          <button type="button" className="secondary-btn" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        <h1>{title}</h1>
        {children}
      </main>
    </div>
  );
}

export function Placeholder({ items }: { items: { title: string; text: string }[] }) {
  return (
    <div className="card-grid">
      {items.map((i) => (
        <div key={i.title} className="card">
          <h3>{i.title}</h3>
          <p className="muted">{i.text}</p>
          <span className="soon">Coming soon</span>
        </div>
      ))}
    </div>
  );
}
