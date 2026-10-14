import { DashboardLayout, Placeholder } from '../../components/DashboardLayout';

export function ApplicantDashboard() {
  return (
    <DashboardLayout title="Applicant dashboard">
      <Placeholder
        items={[
          { title: 'Find jobs', text: 'Browse logistics vacancies by role, location and license class.' },
          { title: 'My profile', text: 'Experience, driver license categories, documents and resume.' },
          { title: 'My applications', text: 'Track the status of jobs you applied to.' },
        ]}
      />
    </DashboardLayout>
  );
}
