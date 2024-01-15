import BlogDetailContainer from '../../../../containers/dashboard/blog/detail.container';
import DashboardLayout from '../../../../layouts/dashboard';

// ----------------------------------------------------------------------
BlogDetailPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);
// ----------------------------------------------------------------------

export default function BlogDetailPage() {
  return (
    <>
      {BlogDetailContainer(true)}
    </>
  );
}
