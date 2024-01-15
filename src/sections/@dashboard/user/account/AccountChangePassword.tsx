import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { Stack, Card } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { IUserAccountChangePassword } from '../../../../@types/user';
// components
import Iconify from '../../../../components/iconify';
import { useSnackbar } from '../../../../components/snackbar';
import FormProvider, { RHFTextField } from '../../../../components/hook-form';
// Locales
import { useLocales } from 'src/locales';
// auth context
import { useAuthContext } from 'src/auth/useAuthContext';
// apis
import usersApi from 'src/api/usersApi';
// ----------------------------------------------------------------------

type FormValuesProps = IUserAccountChangePassword;

export default function AccountChangePassword() {
  const { translate } = useLocales();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const ChangePassWordSchema = Yup.object().shape({
    oldPassword: Yup.string().required(`${translate('auth.old_password_required')}`),
    newPassword: Yup.string()
      .required(`${translate('auth.new_password_required')}`)
      .min(6, `${translate('auth.required_password')}`)
      .test(
        `${translate('auth.no_match')}`,
        `${translate('auth.pass_diff')}`,
        (value, { parent }) => value !== parent.oldPassword
      ),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword')], `${translate('auth.pass_match')}`),
  });

  const defaultValues = {
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };

  const methods = useForm({
    resolver: yupResolver(ChangePassWordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      // await new Promise((resolve) => setTimeout(resolve, 500));
      // reset();
      if (user !== null) {
        const checkLoginResponse = await usersApi.postLogIn({email: user.email, password: data.oldPassword});
        if (checkLoginResponse.access_token) {
          await usersApi.updateById(user.id, { password: data.newPassword} );
          reset();
          enqueueSnackbar(`${translate('auth.update_password_success')}`, {variant: "success"});
        }
        enqueueSnackbar('Update success!', {variant: "success"});
      }
      
      console.log('DATA', data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Update success!', {variant: "success"});
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <Stack spacing={3} alignItems="flex-end" sx={{ p: 3 }}>
          <RHFTextField name="oldPassword" type="password" label={`${translate('user.old_password')}`} />

          <RHFTextField
            name="newPassword"
            type="password"
            label={`${translate('user.new_password')}`}
            helperText={
              <Stack component="span" direction="row" alignItems="center">
                <Iconify icon="eva:info-fill" width={16} sx={{ mr: 0.5 }} /> {`${translate('user.password_minimum')}`}
              </Stack>
            }
          />

          <RHFTextField name="confirmNewPassword" type="password" label={`${translate('user.confirm_password')}`} />

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {`${translate('common.save_changes')}`}
          </LoadingButton>
        </Stack>
      </Card>
    </FormProvider>
  );
}
