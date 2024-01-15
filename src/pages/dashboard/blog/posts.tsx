import Head from 'next/head';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// container
import PostsContainer from '../../../containers/dashboard/blog/posts.container';
import { useLocales } from '../../../locales';

// ----------------------------------------------------------------------

BlogPostsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

// ----------------------------------------------------------------------
export default function BlogPostsPage() {
  const { translate } = useLocales();
  return (
    <>
      <Head>
        <title> {`Blog: ${translate('blog.posts')}  | BIMNEXT V3 `}</title>
      </Head>
      <PostsContainer />
    </>
  );
}
