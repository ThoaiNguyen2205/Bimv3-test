// @mui
import { Tooltip, Stack, Typography, Link, Box } from '@mui/material';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// layouts
import LoginLayout from '../../layouts/login';
//
import AuthLoginForm from './AuthLoginForm';
// locales
import { useLocales } from 'src/locales';
import LanguagePopover from 'src/layouts/dashboard/header/LanguagePopover';
// Paths
import { PATH_AUTH } from 'src/routes/paths';
import systemsApi from 'src/api/systemsApi';
import { useEffect, useState } from 'react';
import { ISystem } from 'src/shared/types/system';
// ----------------------------------------------------------------------

export default function Login() {
  const { method } = useAuthContext();
  const { translate, currentLang } = useLocales();

  const [image, setImage] = useState('');

  useEffect(() => {
    const loadImage = async () => {
      const img: ISystem = await systemsApi.getByName('login_img') as ISystem;
      if (img !== null && img !== undefined) {
        setImage(img.value);
      }
    }
    loadImage();
  }, []);

  return (
    <LoginLayout
      illustration={(image === '') ? image : `${process.env.REACT_APP_APIFILE}images/${image}`}
    >
      <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
        <Typography variant="h4">{`${translate('auth.sign_in_to_bimnext')}`}</Typography>

        <Stack direction="row" spacing={0.5}>
          <Typography variant="body2">{`${translate('auth.new_user')}`}</Typography>

          <Link href={PATH_AUTH.register} variant="subtitle2">{`${translate('auth.create_an_account')}`}</Link>
        </Stack>

        <Tooltip title={currentLang.label} placement="top">
          <Box
            sx={{ width: 32, height: 32, position: 'absolute', right: 0 }}
          >
            <LanguagePopover /> 
          </Box>
        </Tooltip>
      </Stack>

      <AuthLoginForm />

    </LoginLayout>
  );
}
