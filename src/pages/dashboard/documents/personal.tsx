// next
import Head from 'next/head';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// locales
import { useLocales } from '../../../locales';

import DocPersonalContainer from '../../../containers/dashboard/documents/personal.container';
// Container

DocumentsPersonalPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function DocumentsPersonalPage() {
  const { translate } = useLocales();

  return (
    <>
      <Head>
        <title>
          {`${translate('nav.document')} : ${translate(
            'documents.personal'
          )} | BIMNEXT V3`}
        </title>
      </Head>

      <DocPersonalContainer />
    </>
  );
}
