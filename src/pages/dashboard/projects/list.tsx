// next
import Head from 'next/head';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// locales
import { useLocales } from 'src/locales';

// Container
import ProjectsContainer from 'src/containers/dashboard/projects/projects.container';

UserListPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function UserListPage() {
 
  const { translate } = useLocales();

  return (
    <>
      <Head>
        <title> {`${translate('nav.project')}`} </title>
      </Head>

      <ProjectsContainer />

    </>
  );
}
