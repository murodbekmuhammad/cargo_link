import { DashboardLayout, Placeholder } from '../../components/DashboardLayout';

export function CompanyDashboard() {
  return (
    <DashboardLayout title="Company dashboard">
      <Placeholder
        items={[
          { title: 'Post a job', text: 'Create vacancies for drivers, dispatchers, warehouse staff and more.' },
          { title: 'My vacancies', text: 'Manage your open and closed positions.' },
          { title: 'Applications', text: 'Review candidates and move them through your hiring pipeline.' },
        ]}
      />
    </DashboardLayout>
  );
}
