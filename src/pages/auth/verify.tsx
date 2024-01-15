// react
import { useEffect, useState } from 'react';
// next
import Head from 'next/head';
import { useRouter } from 'next/router';
// @mui
import { Typography, Button } from '@mui/material';
// layouts
import CompactLayout from '../../layouts/compact';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
// sections
import AuthVerifyCodeForm from '../../sections/auth/AuthVerifyCodeForm';
// assets
import { EmailInboxIcon } from '../../assets/icons';
// locales
import { useLocales } from 'src/locales';
// apis
import usersApi from 'src/api/usersApi';
import { IUser } from 'src/shared/types/user';

// ----------------------------------------------------------------------

VerifyCodePage.getLayout = (page: React.ReactElement) => <CompactLayout>{page}</CompactLayout>;

// ----------------------------------------------------------------------

type initialState = {
  labelVerify: {
    title: string,
    checkMail: string,
    note01: string,
    note02: string,
    note03: string,
    resend: string,
    returnMess: string,
  },
  email: string
}

export default function VerifyCodePage() {
  const { translate, currentLang } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const { push } = useRouter();

  const [infoVerify, setInfoVerify] = useState<initialState>({
    labelVerify: {
      title: '',
      checkMail: '',
      note01: '',
      note02: '',
      note03: '',
      resend: '',
      returnMess: ''
    },
    email: ''
  });

  useEffect(() => {
    setInfoVerify((prevState: initialState) => {
      return {
        ...prevState,
        labelVerify: {
          title: `${translate('auth.verify')}`,
          checkMail: `${translate('auth.check_your_email')}`,
          note01: `${translate('auth.verify_note_01')}`,
          note02: `${translate('auth.verify_note_02')}`,
          note03: `${translate('auth.verify_note_03')}`,
          resend: `${translate('auth.resend')}`,
          returnMess: `${translate('auth.return_to_sign_in')}`,
        }
      }
    });
  }, [currentLang]);
  
  useEffect(() => {
    let search = window.location.search;
    let params = new URLSearchParams(search);
    let mail = params.get('mail');
    if (mail) {
      setInfoVerify((prevState: any) => {
        return { ...prevState, email: mail }
      });
    }
  }, [infoVerify.labelVerify.title]);

  const onBackLogin = async () => {
    try {
      push(PATH_AUTH.login);
    } catch (error) {
      console.error(error);
    }
  };

  const resendCode = async () => {
    try {
      const user: IUser = await usersApi.getByEmail(infoVerify.email);
      
      const updateUser: IUser = await usersApi.resendCodeById(user.id);
      if (updateUser.active === true) {
        enqueueSnackbar('Re-send code success! Gửi lại mã thành công', {variant: "info"});
      }
      
    } catch (error) {
      enqueueSnackbar('Re-send code! Lỗi gửi lại mã', {variant: "info"});
    }
  }

  return (
    <>
      <Head>
        <title> BIMnext </title>
      </Head>

      <EmailInboxIcon sx={{ mb: 5, height: 96 }} />

      <Typography variant="h3" paragraph>
        {infoVerify.labelVerify.checkMail}
      </Typography>

      <Typography sx={{ color: 'text.secondary', mb: 5 }}>
        {`
          ${infoVerify.labelVerify.note01}
          ${infoVerify.email}
          ${infoVerify.labelVerify.note02}
        `}
      </Typography>

      <AuthVerifyCodeForm />

      <Typography variant="body2" sx={{ my: 3 }}>
        {infoVerify.labelVerify.note03}
        <Button
          variant="outlined"
          color="inherit"
          onClick={resendCode}
        >
          {infoVerify.labelVerify.resend}
        </Button>
      </Typography>

      <Button
        variant="outlined"
        color="primary"
        sx={{
          mx: 'auto',
          alignItems: 'center',
          display: 'inline-flex',
        }}
        onClick={onBackLogin}
      >
        <Iconify icon="eva:chevron-left-fill" width={16} />
        {infoVerify.labelVerify.returnMess}
      </Button>
    </>
  );
}
