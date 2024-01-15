// next
import NextLink from 'next/link';
// @mui
import { Tooltip, Stack, Typography, Link, Box } from '@mui/material';
// layouts
import LoginLayout from '../../layouts/login';
// routes
import { PATH_AUTH } from '../../routes/paths';
// locales
import { useLocales } from 'src/locales';
import LanguagePopover from 'src/layouts/dashboard/header/LanguagePopover';
//
import AuthRegisterForm from './AuthRegisterForm';
import systemsApi from 'src/api/systemsApi';
import { useEffect, useState } from 'react';
import { ISystem } from 'src/shared/types/system';
// ----------------------------------------------------------------------

export default function Register() {
  const { translate, currentLang } = useLocales();
  const [image, setImage] = useState('');

  useEffect(() => {
    const loadImage = async () => {
      const img: ISystem = await systemsApi.getByName('register_img') as ISystem;
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
        <Typography variant="h4">{`${translate('auth.new_account')}`}</Typography>

        <Stack direction="row" spacing={0.5}>
          <Typography variant="body2"> {`${translate('auth.have_account')}`} </Typography>

          <Link component={NextLink} href={PATH_AUTH.login} variant="subtitle2">
          {`${translate('auth.login')}`}
          </Link>
        </Stack>

        <Tooltip title={currentLang.label} placement="top">
          <Box
            sx={{ width: 32, height: 32, position: 'absolute', right: 0 }}
          >
            <LanguagePopover /> 
          </Box>
        </Tooltip>

      </Stack>

      <AuthRegisterForm />

      <Typography
        component="div"
        sx={{ color: 'text.secondary', mt: 3, typography: 'caption', textAlign: 'center' }}
      >
        {`${translate('auth.agree_policy')}`}
        <Link underline="always" color="text.primary">
          {`${translate('auth.terms_of_services')}`}
        </Link>
        {`${translate('auth.and')}`}
        <Link underline="always" color="text.primary">
          {`${translate('auth.privacy_policy')}`}
        </Link>
        .
      </Typography>

    </LoginLayout>
  );
}
