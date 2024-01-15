import { useState } from 'react';
// next
import { useRouter } from 'next/router';
// @mui
import { Theme, alpha } from '@mui/material/styles';
import { Box, Divider, Grid, Typography, Stack, MenuItem, SxProps, Tooltip } from '@mui/material';
// routes
import { PATH_DASHBOARD, PATH_AUTH } from '../../../routes/paths';
// auth
import { useAuthContext } from '../../../auth/useAuthContext';
// components
import Iconify from 'src/components/iconify/Iconify';
import { useSnackbar } from '../../../components/snackbar';
import MenuPopover from '../../../components/menu-popover';
import { IconButtonAnimate } from '../../../components/animate';
import Image from '../../../components/image';
// locales
import { useLocales } from 'src/locales';
import { t } from 'i18next';
// ----------------------------------------------------------------------

interface Props {
  sx?: SxProps<Theme>;
}

export default function SuperAdminPopover({ sx }: Props) {
  const { currentLang } = useLocales();
  const { replace, push } = useRouter();

  const { user, logout } = useAuthContext();

  const ADMIN_OPTIONS = [
    {
      label: t('superadmin.customers'),
      linkTo: PATH_DASHBOARD.superadmin.customers,
      icon: 'raphael:customer'
    },
    {
      label: t('superadmin.users'),
      linkTo: PATH_DASHBOARD.superadmin.users,
      icon: 'la:users-cog'
    },
  ];

  const IMG_OPTIONS = [
    {
      label: t('superadmin.system_variables'),
      linkTo: PATH_DASHBOARD.superadmin.systems,
      icon: 'grommet-icons:system'
    },
  ];

  const { enqueueSnackbar } = useSnackbar();

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleLogout = async () => {
    try {
      logout();
      replace(PATH_AUTH.login);
      handleClosePopover();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  const handleClickItem = (path: string) => {
    handleClosePopover();
    push(path);
  };

  return (
    <>
      <IconButtonAnimate
        onClick={handleOpenPopover}
        sx={{
          p: 0,
          ...(openPopover && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
            },
          }),
          ...sx,
        }}
      >
        <Image
          src={`/assets/icons/navbar/ic_admin.gif`}
          alt='superadmin'
          key='superadmin'
          ratio='1/1'
          sx={{
            width: '30px'
          }}
        />
      </IconButtonAnimate>

      <MenuPopover open={openPopover} onClose={handleClosePopover} sx={{ width: 200, p: 0 }}>
        {/* <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
          </Box>

          <Tooltip title="Close">
            <IconButtonAnimate color="primary" onClick={handleClosePopover}>
              <Iconify icon="eva:close-outline" width={20} height={20} />
            </IconButtonAnimate>
          </Tooltip>
        </Box> */}

        {/* <Divider sx={{ borderStyle: 'dashed' }} /> */}

        <Stack sx={{ p: 1 }}>
          {ADMIN_OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              <Iconify icon={option.icon} width={20} height={20} />
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {IMG_OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              <Iconify icon={option.icon} width={20} height={20} />
              {option.label}
            </MenuItem>
          ))}
        </Stack>

      </MenuPopover>
    </>
  );
}
