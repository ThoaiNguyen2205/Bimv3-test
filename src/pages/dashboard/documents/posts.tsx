// next
import Head from 'next/head';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// locales
import { useLocales } from '../../../locales';
import DocPostsContainer from '../../../containers/dashboard/documents/posts.container';
// Container

DocumentPostsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function DocumentPostsPage() {
  const { translate } = useLocales();
  return (
    <>
      <Head>
        <title>
          {' '}
          {`${translate('nav.document')} : ${translate(
            'blog.posts'
          )} | BIMNEXT V3`}
        </title>
      </Head>

      <DocPostsContainer />
    </>
  );
}
