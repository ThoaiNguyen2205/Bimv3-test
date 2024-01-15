// next
import Head from 'next/head';
import NextLink from 'next/link';
// react
import { useState, useEffect } from 'react';
// @mui
import { Link, Typography } from '@mui/material';
// routes
import { PATH_AUTH } from '../../routes/paths';
// layouts
import CompactLayout from '../../layouts/compact';
// components
import Iconify from '../../components/iconify';
// sections
import AuthResetPasswordForm from '../../sections/auth/AuthResetPasswordForm';
// assets
import { PasswordIcon } from '../../assets/icons';

// ----------------------------------------------------------------------

ResetPasswordPage.getLayout = (page: React.ReactElement) => <CompactLayout>{page}</CompactLayout>;

// ----------------------------------------------------------------------

import { useLocales } from 'src/locales';

type LocalState = {
  labelVerify: {
    title: string,
    info: string,
    signinButton: string,
  }
}

// ----------------------------------------------------------------------

export default function ResetPasswordPage() {
  const { currentLang, translate } = useLocales();

  const [localState, setLocalState] = useState<LocalState>({
    labelVerify: {
      title: `${translate('auth.reset_passwords')}`,
      info: `${translate('auth.reset_info')}`,
      signinButton: `${translate('auth.return_to_sign_in')}`,
    }
  });

  useEffect(() => {
    setLocalState((prevState: LocalState) => {
      return {
        ...prevState,
        title: `${translate('auth.reset_passwords')}`,
        info: `${translate('auth.reset_info')}`,
        signinButton: `${translate('auth.return_to_sign_in')}`,
      }
    });
  }, [currentLang]);

  return (
    <>
      <Head>
        <title> BIMnext </title>
      </Head>

      <PasswordIcon sx={{ mb: 5, height: 96 }} />

      <Typography variant="h3" paragraph>
        {localState.labelVerify.title}?
      </Typography>

      <Typography sx={{ color: 'text.secondary', mb: 5 }}>
        {localState.labelVerify.info}
      </Typography>

      <AuthResetPasswordForm />

      <Link
        component={NextLink}
        href={PATH_AUTH.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          mt: 3,
          mx: 'auto',
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify icon="eva:chevron-left-fill" width={16} />
        {localState.labelVerify.signinButton}
      </Link>
    </>
  );
}
