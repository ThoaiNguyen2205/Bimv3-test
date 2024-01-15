// layouts
import DashboardLayout from '../../../../layouts/dashboard';
import DocEditorContainer from '../../../../containers/dashboard/documents/editor.container';

// ----------------------------------------------------------------------

BlogPostPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

// ----------------------------------------------------------------------

export default function BlogPostPage() {
  return (
    <>
      <DocEditorContainer />
    </>
  );
}
