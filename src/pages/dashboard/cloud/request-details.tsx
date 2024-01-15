
// next
import Head from 'next/head';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// locales
import { useLocales } from 'src/locales';
import RequestContainer from 'src/containers/dashboard/cloud/request.container';

RequestDetailsPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function RequestDetailsPage() {
  const { translate } = useLocales();

  return (
    <>
      <Head>
        <title> {`${translate('nav.request')}`} </title>
      </Head>

      <RequestContainer />
    </>
  );
}
