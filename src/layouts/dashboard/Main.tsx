// @mui
import { Box, BoxProps } from '@mui/material';
// hooks
import useResponsive from '../../hooks/useResponsive';
// config
import { HEADER, NAV } from '../../config-global';
// components
import { useSettingsContext } from '../../components/settings';
import InvitationsDrawer from 'src/components/invitations/InvitationsDrawer';
import DocInvitationsDrawer from 'src/components/dashboard/doc-invitations/DocInvitationsDrawer';
import ApprovesDrawer from 'src/components/approves/ApprovesDrawer';
// ----------------------------------------------------------------------

const SPACING = 8;

export default function Main({ children, sx, ...other }: BoxProps) {
  const { themeLayout } = useSettingsContext();

  const isNavHorizontal = themeLayout === 'horizontal';

  const isNavMini = themeLayout === 'mini';

  const isDesktop = useResponsive('up', 'lg');

  if (isNavHorizontal) {
    return (
      <Box
        component="main"
        sx={{
          pt: `${HEADER.H_MOBILE + SPACING}px`,
          pb: `${HEADER.H_MOBILE + SPACING}px`,
          ...(isDesktop && {
            px: 2,
            pt: `${HEADER.H_DASHBOARD_DESKTOP + 80}px`,
            pb: `${HEADER.H_DASHBOARD_DESKTOP + SPACING}px`,
          }),
        }}
      >
        {children}
        <InvitationsDrawer />
        <ApprovesDrawer />
        <DocInvitationsDrawer />
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        px: '14px',
        py: `14px`,
        ...(isDesktop && {
          width: `calc(100% - ${NAV.W_DASHBOARD}px)`,
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_DASHBOARD_MINI}px)`,
          }),
        }),
        ...(!isDesktop && {
          py: `${HEADER.H_MOBILE}px`,
        }),
        ...sx,
      }}
      {...other}
    >
      {children}
      <InvitationsDrawer />
      <ApprovesDrawer />
      <DocInvitationsDrawer />
    </Box>
  );
}
