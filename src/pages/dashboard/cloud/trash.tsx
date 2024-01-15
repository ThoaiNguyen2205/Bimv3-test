// next
import Head from 'next/head';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// locales
import { useLocales } from 'src/locales';

// Container
import TrashContainer from 'src/containers/dashboard/cloud/trash.container';

TrashPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function TrashPage() {
 
  const { translate } = useLocales();

  return (
    <>
      <Head>
        <title> {`${translate('nav.trash')}`} </title>
      </Head>

      <TrashContainer />

    </>
  );
}
