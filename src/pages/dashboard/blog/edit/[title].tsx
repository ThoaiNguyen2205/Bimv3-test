// next
import Head from 'next/head';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// layouts
import DashboardLayout from '../../../../layouts/dashboard/DashboardLayout';
//locales
import { useLocales } from '../../../../locales';
//context
import { useSettingsContext } from '../../../../components/settings';
//component
import CustomBreadcrumbs from '../../../../components/custom-breadcrumbs/CustomBreadcrumbs';
import { BlogEditPostForm } from '../../../../sections/@dashboard/blog';

// ----------------------------------------------------------------------
BlogEditPostPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);
// ----------------------------------------------------------------------

export default function BlogEditPostPage() {
  const { themeStretch } = useSettingsContext();
  const { translate } = useLocales();

  return (
    <>
      <Head>
        <title>{`Blog: ${translate('blog.edit_post')}  | BIMNEXT V3 `}</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={`${translate('blog.edit_post')}`}
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
              name: `${translate('blog.edit_post')}`
            }
          ]}
        />
        <BlogEditPostForm />
      </Container>
    </>
  );
}
