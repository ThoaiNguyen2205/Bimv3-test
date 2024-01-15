import { useEffect, useState } from 'react';
// @mui
import { Stack, Box } from '@mui/material';
// config
import { NAV } from '../../../config-global';
// utils
import { hideScrollbarX } from '../../../utils/cssStyles';
// components
import Logo from '../../../components/logo';
import { NavSectionMini } from '../../../components/nav-section';
//
import AccountPopover from '../header/AccountPopover';
// auth context:
import { useAuthContext } from 'src/auth/useAuthContext';
// enums
import { UserRoleEnum } from 'src/shared/enums';
import NavToggleButton from './NavToggleButton';
import { getNavMenu } from './config-navigation';
import SuperAdminPopover from '../header/SuperAdminPopover';
import CustomersPopover from '../header/CustomersPopover';
// apis
import bimnextAppsApi from 'src/api/bimnextAppsApi';
// ----------------------------------------------------------------------

export default function NavMini() {
  const { user } = useAuthContext();

  const [navConfig, setNavConfig] = useState<any>();  
  useEffect(() => {
    const loadNavData = async () => {
      if (user?.customer !== null) {
        const appsRes = await bimnextAppsApi.getByCustomer(user?.customer._id);
        const navData = getNavMenu(appsRes.data);
        setNavConfig(navData);
      } else {
        const navData = getNavMenu([]);
        setNavConfig(navData);
      }
    }
    loadNavData();
  }, [user]);

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_DASHBOARD_MINI },
      }}
    >
      <NavToggleButton
        sx={{
          top: 22,
          left: NAV.W_DASHBOARD_MINI - 12,
        }}
      />

      <Stack
        sx={{
          pb: 2,
          height: 1,
          position: 'fixed',
          width: NAV.W_DASHBOARD_MINI,
          borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          ...hideScrollbarX,
        }}
      >
        <Logo sx={{ mx: 'auto', my: 2 }} />
        <CustomersPopover sx={{ mx: 'auto', mb: 2 }} />
        <AccountPopover sx={{ mx: 'auto', mb: 3 }} />

        <NavSectionMini data={navConfig} />
        {(user?.role === UserRoleEnum.SuperAdmin) ? 
          <>
            <SuperAdminPopover sx={{ mx: 'auto', my: 2 }} />
          </>
          : null
        }
      </Stack>
    </Box>
  );
}
