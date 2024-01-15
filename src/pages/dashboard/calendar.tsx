import Head from 'next/head';
import DashboardLayout from '../../layouts/dashboard';
// components
import CalendarContainer from '../../containers/dashboard/calendar/calendar.container';
import { useLocales } from '../../locales';

// ----------------------------------------------------------------------

CalendarPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);
// ----------------------------------------------------------------------

export default function CalendarPage() {
  const { translate } = useLocales();
  return (
    <>
      <Head>
        <title> {`${translate('nav.calendar')} | BIMNEXT V3`}</title>
      </Head>

      <CalendarContainer />
    </>
  );
}
