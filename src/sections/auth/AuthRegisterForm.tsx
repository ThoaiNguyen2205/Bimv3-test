import { useState } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, IconButton, InputAdornment, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// components
import Iconify from '../../components/iconify';
import FormProvider, { RHFTextField } from '../../components/hook-form';
// locales
import { useLocales } from 'src/locales';
// api
import usersApi from 'src/api/usersApi';
// Helpers
import { removeAccents } from 'src/shared/helpers/stringHelpers'
// types
import { IUser } from 'src/shared/types/user';

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
  password: string;
  fullname: string;
  afterSubmit?: string;
};

export default function AuthRegisterForm() {
  const { translate } = useLocales();
  const { register } = useAuthContext();

  const [showPassword, setShowPassword] = useState(false);

  const RegisterSchema = Yup.object().shape({
    fullname: Yup.string().required(`${translate('auth.required_fullname')}`),
    email: Yup.string().email(`${translate('auth.valid_email')}`).max(255).required(`${translate('auth.required_email')}`),
    password: Yup.string().min(6).max(255).required(`${translate('auth.required_password')}`)
  });

  const defaultValues = {
    fullname: '',
    email: '',
    password: '',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const generateUsername = async (fullname: string): Promise<string> => {
    
    const tach: string[] = fullname.split(' ');
    let ho: string = '';
    for (const tu of tach) {
      ho = ho + tu.substring(0, 1);
    }
    ho = ho.slice(0, -1);
    const tencodau: string = tach[tach.length - 1];
    const ten: string = removeAccents(tencodau);

    // Kiểm tra username đã đăng ký hay chưa?
    let dem = 2;
    let uname: string = ten + ho;
    let uResponse: IUser = await usersApi.getByUsername(uname);
    while(uResponse.username !== undefined)
    {
      uname = ten + ho + dem
      uResponse = await usersApi.getByUsername(uname);
      dem = dem + 1;
    }
    return uname;
  }

  const onSubmit = async (data: FormValuesProps) => {
    try {
      if (register) {
        const username = await generateUsername(data.fullname);
        await register(data.fullname, username, data.email, data.password);
      }
    } catch (error) {
      console.error(error);
      reset();
      setError('afterSubmit', {
        ...error,
        message: error.response.data.message || error,
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2.5}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <RHFTextField name="fullname" label={`${translate('auth.fullname')}`} />
        <RHFTextField name="email" label={`${translate('auth.email')}`} />

        <RHFTextField
          name="password"
          label={`${translate('auth.password')}`}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton
          fullWidth
          color="primary"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting || isSubmitSuccessful}
        >
          {`${translate('auth.create_acount')}`}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
