import { listUsers } from '../../auth/storage';
import { listVacancies } from '../../data/vacancies';
import { DashboardLayout, Placeholder } from '../../components/DashboardLayout';

export function AdminDashboard() {
  const users = listUsers();
  const count = (role: string) => users.filter((u) => u.role === role).length;

  return (
    <DashboardLayout title="Admin dashboard">
      <div className="stats">
        <div className="stat"><span className="stat-value">{count('company')}</span>Companies</div>
        <div className="stat"><span className="stat-value">{count('applicant')}</span>Applicants</div>
        <div className="stat"><span className="stat-value">{listVacancies().length}</span>Open jobs</div>
      </div>
      <Placeholder
        items={[
          { title: 'Company verification', text: 'Review and approve newly registered companies.' },
          { title: 'Job moderation', text: 'Approve, edit or remove job postings.' },
          { title: 'User management', text: 'Block or manage applicant and company accounts.' },
        ]}
      />
    </DashboardLayout>
  );
}
