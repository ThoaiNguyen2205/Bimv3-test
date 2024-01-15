// react
import { useEffect, useState } from 'react';
// yup
import * as Yup from 'yup';
// next
import { useRouter } from 'next/router';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, FormHelperText } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSnackbar } from '../../components/snackbar';
import FormProvider, { RHFCodes } from '../../components/hook-form';
// locales
import { useLocales } from 'src/locales';
// api
import usersApi from 'src/api/usersApi';
// types
import { IUser } from 'src/shared/types/user';

// ----------------------------------------------------------------------

type FormValuesProps = {
  code1: string;
  code2: string;
  code3: string;
  code4: string;
  code5: string;
  code6: string;
};

type LocalState = {
  error_code: string,
  verify: string,
  email: string,
  showVerify: boolean,
}

export default function AuthVerifyCodeForm() {
  const { translate, currentLang } = useLocales();
  const { push } = useRouter();

  const [localState, setLocalState] = useState<LocalState>({
    error_code: '',
    verify: '',
    email: '',
    showVerify: true,
  });
  
  useEffect(() => {
    setLocalState((prevState : LocalState) => ({ ...prevState, error_code: `${translate('auth.required_code')}` }));
    setLocalState((prevState : LocalState) => ({ ...prevState, verify: `${translate('auth.verify')}` }));
  }, [currentLang]);

  useEffect(() => {
    let search = window.location.search;
    let params = new URLSearchParams(search);
    let mail = params.get('mail');
    if (mail !== null) {
      setLocalState((prevState : LocalState) => ({ ...prevState, email: (mail as string) }));
    }
  }, [localState.email]);

  const { enqueueSnackbar } = useSnackbar();

  const VerifyCodeSchema = Yup.object().shape({
    code1: Yup.string().required('Code is required'),
    code2: Yup.string().required('Code is required'),
    code3: Yup.string().required('Code is required'),
    code4: Yup.string().required('Code is required'),
    code5: Yup.string().required('Code is required'),
    code6: Yup.string().required('Code is required'),
  });

  const defaultValues = {
    code1: '',
    code2: '',
    code3: '',
    code4: '',
    code5: '',
    code6: '',
  };

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(VerifyCodeSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      if (localState.email === '') enqueueSnackbar('Wrong link, find information from your email! Sai liên kết. Vui lòng mở lại từ email', {variant: "warning"});
      const user: IUser = await usersApi.getByEmail(localState.email);
      const code = Object.values(data).join('');
      if (user.activeCode === code){
        try {
          await usersApi.updateById(user.id, {active: true});
          enqueueSnackbar('Verify success! Xác thực thành công', {variant: "success"});
          push(PATH_DASHBOARD.root);
        } catch (e) {
          console.log(e);
        }
      } else {
        enqueueSnackbar('Wrong code! Sai mã', {variant: "warning"});
      }
      
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFCodes keyName="code" inputs={['code1', 'code2', 'code3', 'code4', 'code5', 'code6']} />

        {(!!errors.code1 ||
          !!errors.code2 ||
          !!errors.code3 ||
          !!errors.code4 ||
          !!errors.code5 ||
          !!errors.code6) && (
          <FormHelperText error sx={{ px: 2 }}>
            {localState.error_code}
          </FormHelperText>
        )}

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ mt: 3 }}
        >
          {localState.verify}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
