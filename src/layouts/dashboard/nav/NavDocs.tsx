// @mui
import { Stack, Button, Typography, Box } from '@mui/material';
// auth
import { useAuthContext } from '../../../auth/useAuthContext';
// locales
import { useLocales } from '../../../locales';
// routes
import { PATH_DOCS } from '../../../routes/paths';
import { UserStatusEnum } from 'src/shared/enums';
import usersApi from 'src/api/usersApi';
import { useSnackbar } from 'notistack';
import Iconify from 'src/components/iconify/Iconify';

// ----------------------------------------------------------------------

export default function NavDocs() {

  const { user, logout } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();

  const handleLogout = async () => {
    try {
      await usersApi.updateById(user?.id, { status: UserStatusEnum.LoggedOut});
      logout();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  return (
    <Stack
      spacing={3}
      sx={{
        px: 5,
        pb: 5,
        mt: 10,
        width: 1,
        display: 'block',
        textAlign: 'center',
      }}
    >
      <Box component="img" src="/assets/illustrations/illustration_docs.svg" />

      <Box>
        <Typography gutterBottom variant="subtitle1">
          {`${translate('docs.hi')}, ${user?.username}`}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}>
          {`${translate('docs.description')}`}
        </Typography>
      </Box>

      <Box>
        <Button
          href={PATH_DOCS.root}
          target="_blank"
          rel="noopener"
          variant="contained"
          startIcon={<Iconify icon="solar:documents-line-duotone" width={16} />}
        >
          {`${translate('docs.documentation')}`}
        </Button>
      </Box>

      <Box>
        <Button
          variant="contained"
          color='inherit'
          startIcon={<Iconify icon="solar:logout-3-line-duotone" width={16} />}
          onClick={handleLogout}
        >
          {`${translate('auth.logout')}`}
        </Button>
      </Box>
      
    </Stack>
  );
}
