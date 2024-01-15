import { useEffect, useState } from 'react';
// next
import { useRouter } from 'next/router';
// @mui
import { Box, Stack, Drawer } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// config
import { NAV } from '../../../config-global';
// components
import Logo from '../../../components/logo';
import FullLogo from 'src/components/logo/FullLogo';
import Scrollbar from '../../../components/scrollbar';
import { NavSectionVertical } from '../../../components/nav-section';
//

import NavDocs from './NavDocs';
import NavAccount from './NavAccount';
import NavCustomer from './NavCustomer';
import NavSuperAdmin from './NavSuperAdmin';
import NavToggleButton from './NavToggleButton';
import { getNavMenu } from './config-navigation';
import { useAuthContext } from 'src/auth/useAuthContext';
// enums
import { UserRoleEnum } from 'src/shared/enums';
// type
import { NavSectionProps } from '../../../components/nav-section';
// apis
import bimnextAppsApi from 'src/api/bimnextAppsApi';
import { IUser } from 'src/shared/types/user';
import { IBimnextApp } from 'src/shared/types/bimnextApp';
// ----------------------------------------------------------------------

type Props = {
  openNav: boolean;
  onCloseNav: VoidFunction;
};

export default function NavVertical({ openNav, onCloseNav }: Props) {
  const { user } = useAuthContext();
  
  const [navConfig, setNavConfig] = useState<any>();  
  useEffect(() => {
    const loadNavData = async () => {
      if (user?.customer !== null && user?.customer !== undefined) {
        const appsRes = await bimnextAppsApi.getByCustomer(user?.customer._id);
        const navData = getNavMenu(appsRes.data || []);
        setNavConfig(navData);
      } else {
        const navData = getNavMenu([]);
        setNavConfig(navData);
      }
    }
    loadNavData();
  }, [user]);

  const { pathname } = useRouter();

  const isDesktop = useResponsive('up', 'lg');

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          pt: 3,
          pb: 2,
          px: 2.5,
          flexShrink: 0,
        }}
      >
        <FullLogo />
        <NavCustomer />
        <NavAccount />
      </Stack>

      <NavSectionVertical data={navConfig} />

      <Box sx={{ flexGrow: 1 }} />

      
      <Stack
        spacing={3}
        sx={{
          pt: 3,
          pb: 2,
          px: 2.5,
          flexShrink: 0,
        }}
      >
        {(user?.role === UserRoleEnum.SuperAdmin) ? 
          <>
            <NavSuperAdmin />
          </>
          : null
        }
      </Stack>
      <NavDocs />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_DASHBOARD },
      }}
    >
      <NavToggleButton />

      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              zIndex: 0,
              width: NAV.W_DASHBOARD,
              bgcolor: 'transparent',
              borderRightStyle: 'dashed',
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              width: NAV.W_DASHBOARD,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
