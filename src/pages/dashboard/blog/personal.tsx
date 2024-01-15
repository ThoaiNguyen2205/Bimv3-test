import Head from 'next/head';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// container
import BlogPersonalContainer from '../../../containers/dashboard/blog/personal.container';
import { useLocales } from '../../../locales';

// ----------------------------------------------------------------------
BlogPersonalPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

// ----------------------------------------------------------------------
export default function BlogPersonalPage() {
  const { translate } = useLocales();
  return (
    <>
      <Head>
        <title>{`Blog: ${translate(
          'documents.personal'
        )}  | BIMNEXT V3 `}</title>
      </Head>
      <BlogPersonalContainer />
    </>
  );
}
