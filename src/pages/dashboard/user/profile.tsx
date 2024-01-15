import { useState } from 'react';
// next
import Head from 'next/head';
// @mui
import { Tab, Card, Tabs, Container, Box } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// auth
import { useAuthContext } from '../../../auth/useAuthContext';
// locales
import { useLocales } from 'src/locales';
// _mock_
import {
  _userAbout,
  _userFeeds,
  _userFriends,
  _userGallery,
  _userFollowers
} from '../../../_mock/arrays';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../../components/settings';
// sections
import {
  Profile,
  ProfileCover,
  ProfileFriends,
  ProfileGallery,
  ProfileFollowers
} from '../../../sections/@dashboard/user/profile';
import useProfile from 'src/redux/profileStore';

// ----------------------------------------------------------------------

UserProfilePage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

// ----------------------------------------------------------------------

export default function UserProfilePage() {
  const { themeStretch } = useSettingsContext();
  const { currentTab, setCurrentTab } = useProfile((state) => ({
    currentTab: state.currentTab,
    setCurrentTab: state.setCurrentTab
  }));
  const { user } = useAuthContext();

  const { translate } = useLocales();

  const [searchFriends, setSearchFriends] = useState('');

  const TABS = [
    {
      value: 'profile',
      label: 'Profile',
      icon: <Iconify icon="ic:round-account-box" />,
      component: <Profile info={_userAbout} posts={_userFeeds} />
    },
    // {
    //   value: 'documents',
    //   label: `${translate('documents.document')}`,
    //   icon: <Iconify icon="basil:document-solid" />,
    //   component: (
    //     <ProfileDocuments
    //     // friends={_userFriends}
    //     // searchFriends={searchFriends}
    //     // onSearchFriends={(event: React.ChangeEvent<HTMLInputElement>) =>
    //     //   setSearchFriends(event.target.value)
    //     // }
    //     />
    //   )
    // },
    {
      value: 'followers',
      label: 'Followers',
      icon: <Iconify icon="eva:heart-fill" />,
      component: <ProfileFollowers followers={_userFollowers} />
    },
    {
      value: 'friends',
      label: 'Friends',
      icon: <Iconify icon="eva:people-fill" />,
      component: (
        <ProfileFriends
          friends={_userFriends}
          searchFriends={searchFriends}
          onSearchFriends={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSearchFriends(event.target.value)
          }
        />
      )
    },
    {
      value: 'gallery',
      label: 'Gallery',
      icon: <Iconify icon="ic:round-perm-media" />,
      component: <ProfileGallery gallery={_userGallery} />
    }
  ];

  return (
    <>
      <Head>
        <title> {user?.username} </title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Card
          sx={{
            mb: 3,
            height: 280,
            position: 'relative'
          }}>
          <ProfileCover />

          <Tabs
            value={currentTab}
            onChange={(event, newValue) => setCurrentTab(newValue)}
            sx={{
              width: 1,
              bottom: 0,
              zIndex: 9,
              position: 'absolute',
              bgcolor: 'background.paper',
              '& .MuiTabs-flexContainer': {
                pr: { md: 3 },
                justifyContent: {
                  sm: 'center',
                  md: 'flex-end'
                }
              }
            }}>
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                icon={tab.icon}
                label={tab.label}
              />
            ))}
          </Tabs>
        </Card>

        {TABS.map(
          (tab) =>
            tab.value === currentTab && (
              <Box key={tab.value}> {tab.component} </Box>
            )
        )}
      </Container>
    </>
  );
}
