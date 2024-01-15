// layouts
import DashboardLayout from '../../../layouts/dashboard';
// Container
import DiscussionsContainer from '../../../containers/dashboard/discussions/discussions.container';

DiscussionsPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function DiscussionsPage() {
  return (
    <DiscussionsContainer />
  );
}
