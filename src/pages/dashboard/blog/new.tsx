// next
import Head from 'next/head';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import { useSettingsContext } from '../../../components/settings';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import { BlogNewPostForm } from '../../../sections/@dashboard/blog';
import { useLocales } from '../../../locales';

// ----------------------------------------------------------------------

BlogNewPostPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);
// ----------------------------------------------------------------------

export default function BlogNewPostPage() {
  const { themeStretch } = useSettingsContext();
  const { translate } = useLocales();
  return (
    <>
      <Head>
        <title>{`Blog: ${translate('blog.new_post')}  | BIMNEXT V3 `}</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={`${translate('blog.create_post')}`}
          links={[
            {
              name: `${translate('nav.dashboard')}`,
              href: PATH_DASHBOARD.root
            },
            {
              name: 'Blog',
              href: PATH_DASHBOARD.blog.root
            },
            {
              name: `${translate('blog.create_post')}`
            }
          ]}
        />

        <BlogNewPostForm />
      </Container>
    </>
  );
}
