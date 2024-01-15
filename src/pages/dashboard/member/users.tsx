// next
import Head from 'next/head';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// locales
import { useLocales } from 'src/locales';

// enums
import UserContainer from 'src/containers/dashboard/member/user.container';

UserListPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function UserListPage() {
 
  const { translate } = useLocales();

  return (
    <>
      <Head>
        <title> {`${translate('nav.member')}`} </title>
      </Head>

      <UserContainer />

    </>
  );
}
