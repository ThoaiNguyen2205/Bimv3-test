// next
import Head from 'next/head';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// locales
import { useLocales } from 'src/locales';

// Container
import FilesContainer from 'src/containers/dashboard/cloud/files.container';

FileManagerPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function FileManagerPage() {
 
  const { translate } = useLocales();

  return (
    <>
      <Head>
        <title> {`${translate('cloud.files_manager')}`} </title>
      </Head>

      <FilesContainer />

    </>
  );
}
