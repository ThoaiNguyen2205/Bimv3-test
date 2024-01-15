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
import { CustomAvatar } from '../../../components/custom-avatar';
import { useSnackbar } from '../../../components/snackbar';
import MenuPopover from '../../../components/menu-popover';
import { IconButtonAnimate } from '../../../components/animate';
// locales
import { useLocales } from 'src/locales';
import { t } from 'i18next';
import LanguagePopover from './LanguagePopover';
// api
import usersApi from 'src/api/usersApi';
// enum
import { UserStatusEnum } from 'src/shared/enums';
// ----------------------------------------------------------------------

interface Props {
  sx?: SxProps<Theme>;
}

export default function AccountPopover({ sx }: Props) {
  const { currentLang, translate } = useLocales();
  const { push } = useRouter();

  const { user, logout } = useAuthContext();

  const OPTIONS = [
    {
      label: 'Kanban',
      linkTo: PATH_DASHBOARD.user.profile,
      icon: 'bi:kanban-fill',
    },
  ];

  const MORE_OPTIONS = [
    {
      label: `${translate('nav.blog')}`,
      linkTo: PATH_DASHBOARD.blog.posts,
      icon: 'carbon:blog',
    },
    {
      label: `${translate('nav.document')}`,
      linkTo: PATH_DASHBOARD.document.posts,
      icon: 'mingcute:document-3-fill',
    },
    {
      label: `${translate('nav.training')}`,
      linkTo: PATH_DASHBOARD.user.profile,
      icon: 'ic:round-model-training',
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
      await usersApi.updateById(user?.id, { status: UserStatusEnum.LoggedOut});
      logout();
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
        <CustomAvatar
          src={process.env.REACT_APP_APIFILE + `images/${user?.avatar}`}
          alt={user?.username}
          name={user?.username}
          sx= {{
            width: '36px',
            height: '36px',
          }}
        />
      </IconButtonAnimate>

      <MenuPopover open={openPopover} onClose={handleClosePopover} sx={{ width: 200, p: 0 }}>
        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              <Iconify icon={option.icon} width={20} height={20} />
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {MORE_OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              <Iconify icon={option.icon} width={20} height={20} />
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ my: 1.5, px: 2.5, align: 'center' }}>   
          <MenuItem key={`${translate('nav.settings')}`} onClick={() => handleClickItem(PATH_DASHBOARD.user.account)}>
            <Iconify icon={'material-symbols:settings-account-box-outline'} width={20} height={20} />
            {`${translate('nav.settings')}`}
          </MenuItem>
          <Grid container>
            <Grid item xs={12} md={4}>
              <LanguagePopover />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }} paddingTop={0.90}>
                {currentLang.label}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleLogout} sx={{ m: 1, borderRadius: 1 }}>
          <Iconify icon='solar:logout-3-line-duotone' width={20} height={20} />
          {t('auth.logout')}
        </MenuItem>
      </MenuPopover>
    </>
  );
}
