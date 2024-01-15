import { useState } from 'react';
// next
import Head from 'next/head';
// @mui
import { Container, Tab, Tabs, Box } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// _mock_
import { _userPayment, _userAddressBook, _userInvoices, _userAbout } from '../../../_mock/arrays';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../../components/settings';
// sections
import {
  AccountGeneral,
  AccountExpire,
  AccountSettings,
  AccountGroup,
  AccountChangePassword,
} from '../../../sections/@dashboard/user/account';
// locales
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

UserAccountPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function UserAccountPage() {
  const { themeStretch } = useSettingsContext();
  const { translate } = useLocales();

  const [currentTab, setCurrentTab] = useState('general');

  const TABS = [
    {
      value: 'general',
      label: `${translate('user.general')}`,
      icon: <Iconify icon="ic:round-account-box" />,
      component: <AccountGeneral />,
    },
    {
      value: 'group',
      label: `${translate('nav.group')}`,
      icon: <Iconify icon="el:group-alt" />,
      component: (
        <AccountGroup addressBook={_userAddressBook} />
      ),
    },
    {
      value: 'expire',
      label: `${translate('user.expire')}`,
      icon: <Iconify icon="ic:round-receipt" />,
      component: <AccountExpire />,
    },
    {
      value: 'settings',
      label: `${translate('nav.settings')}`,
      icon: <Iconify icon="material-symbols:settings-account-box-outline" />,
      component: <AccountSettings />,
    },
    {
      value: 'change_password',
      label: `${translate('user.change_password')}`,
      icon: <Iconify icon="ic:round-vpn-key" />,
      component: <AccountChangePassword />,
    },
  ];

  return (
    <>
      <Head>
        <title> User: Account Settings | BIMNEXT V3</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ p: '5px !important' }}>
        <CustomBreadcrumbs
          heading="Account"
          links={[
            {
              name: `${translate('nav.dashboard')}`,
              href: PATH_DASHBOARD.root,
            },
            { name: `${translate('superadmin.users')}` },
            { name: `${translate('common.account_settings')}` },
          ]}
        />

        <Tabs value={currentTab} onChange={(event, newValue) => setCurrentTab(newValue)}>
          {TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
          ))}
        </Tabs>

        {TABS.map(
          (tab) =>
            tab.value === currentTab && (
              <Box key={tab.value} sx={{ mt: 5 }}>
                {tab.component}
              </Box>
            )
        )}
      </Container>
    </>
  );
}
