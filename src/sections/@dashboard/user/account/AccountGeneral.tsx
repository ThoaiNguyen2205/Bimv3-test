import * as Yup from 'yup';
import { useCallback, useEffect, useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Grid, Card, Stack, Typography, LinearProgress, } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// auth
import { useAuthContext } from '../../../../auth/useAuthContext';
// components
import { useSnackbar } from '../../../../components/snackbar';
import { UploadAvatar } from 'src/components/upload';
import FormProvider, {
  RHFTextField,
} from '../../../../components/hook-form';
import Image from '../../../../components/image';
import { UploadLandscape } from 'src/components/upload';
// locales
import { useLocales } from 'src/locales';
// apis
import uploadsApi from 'src/api/uploadsApi';
import usersApi from 'src/api/usersApi';
// type
import { IUserReqUpdate } from 'src/shared/types/user';
// ----------------------------------------------------------------------

type FormValuesProps = {
  fullname: string;
  username: string;
  email: string;
  avatar: string;
  cover: string;
  about: string | null;
};

type LocalState = {
  avatarUrl: string;
  checkUpload: boolean;
  progress: number;
  progressShow: boolean;
  //
  coverUrl: string;
  coverUpload: boolean;
  coverProgress: number;
  coverProgressShow: boolean;
}

// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { translate } = useLocales();
  const { user, refresh } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const UpdateUserSchema = Yup.object().shape({
    fullname: Yup.string().required(`${translate('user.required_fullname')}`),
    username: Yup.string().required(`${translate('user.required_username')}`),
    avatar: Yup.mixed().required(`${translate('user.required_avatar')}`),
    cover:  Yup.mixed().required(`${translate('user.required_cover')}`),
    about: Yup.string().required(`${translate('user.required_about')}`),
  });

  const defaultValues = {
    fullname: user?.fullname || '',
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    cover: user?.cover || '',
    about: user?.about || '',
  };

  const [localState, setLocalState] = useState<LocalState>({
    avatarUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.avatar}`,
    checkUpload: false,
    progress: 0,
    progressShow: false,
    coverUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.avatar}`,
    coverUpload: false,
    coverProgress: 0,
    coverProgressShow: false,
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      let userUpdateData: IUserReqUpdate = {
        fullname: data.fullname,
        username: data.username,
        about: data.about || '',
        avatar: defaultValues.avatar,
        cover: defaultValues.cover,
      };
      
      if (localState.checkUpload) {
        setLocalState((prevState: LocalState) => ({ ...prevState, progressShow: true }));
        const formData = new FormData(); 
        formData.append("image", localState.avatarUrl);
        const onUploadProgress = (e: any) => {
          setLocalState((prevState: LocalState) => ({ ...prevState, progress: Math.round((100 * e.loaded) / e.total) }));
        };
        const ufileResponse = await uploadsApi.uploadImage(formData, onUploadProgress);

        userUpdateData.avatar = ufileResponse.filename;
        setLocalState((prevState: LocalState) => ({ ...prevState, progressShow: false }));
      }

      if (localState.coverUpload) {
        setLocalState((prevState: LocalState) => ({ ...prevState, coverProgressShow: true }));
        const formData = new FormData(); 
        formData.append("image", localState.coverUrl);
        const onUploadProgress = (e: any) => {
          setLocalState((prevState: LocalState) => ({ ...prevState, coverProgress: Math.round((100 * e.loaded) / e.total) }));
        };
        const ufileResponse = await uploadsApi.uploadImage(formData, onUploadProgress);

        userUpdateData.cover = ufileResponse.filename;
        setLocalState((prevState: LocalState) => ({ ...prevState, coverProgressShow: false }));
      }

      if (data.fullname !== defaultValues.fullname) {
        userUpdateData.fullname = data.fullname;
      }

      if (data.username !== defaultValues.username) {
        // Kiểm tra username mới
        const uResponse = await usersApi.getByUsername(data.username);
        if (uResponse.username !== undefined) {
          enqueueSnackbar(`${translate('auth.existing_username')}`, { variant: 'error' } );
          return;
        } else {
          userUpdateData.username = data.username;
        }
      }

      await usersApi.updateById(user?.id, userUpdateData);
      enqueueSnackbar(`${translate('user.update_user_success')}`, { variant: 'success' } );
      refresh(user?.id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDropAvatar = useCallback((acceptedFiles: any) => {
    const newLogo = acceptedFiles[0];
    if (newLogo) {
      setLocalState((prevState: LocalState) => ({ 
        ...prevState,
        avatarUrl: Object.assign(newLogo, { preview: URL.createObjectURL(newLogo), }),
        checkUpload: true,
      }));
    }
  }, []);

  const handleDropCover = useCallback((acceptedFiles: any) => {
    const newLogo = acceptedFiles[0];
    if (newLogo) {
      setLocalState((prevState: LocalState) => ({ 
        ...prevState,
        coverUrl: Object.assign(newLogo, { preview: URL.createObjectURL(newLogo), }),
        coverUpload: true,
      }));
    }
  }, []);

  useEffect(() => {
    setLocalState((prevState: LocalState) => ({ 
      ...prevState,
      avatarUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.avatar}`,
      coverUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.cover}`,
    }));
  }, [user]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <UploadLandscape
            file={localState.coverUrl}
            onDrop={handleDropCover}
            helperText={
              <Typography
                variant="caption"
                sx={{
                  mt: 2,
                  mx: 'auto',
                  display: 'block',
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                {`${translate('customers.file_accepted')}`}
              </Typography>
            }
            sx={{ height: 250 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ py: 12, px: 3, textAlign: 'center' }}>
            <UploadAvatar
              file={localState.avatarUrl}
              onDrop={handleDropAvatar}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 5,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                  >
                  {`${translate('customers.file_accepted')}`}
                </Typography>
              }
            />
          </Card>
          {localState.progressShow ? <LinearProgress variant="determinate" value={localState.progress} color="success" /> : null}
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
            >
              <RHFTextField name="fullname" label={`${translate('auth.fullname')}`} />
            </Box>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
              sx={{ mt: 3 }}
            >
              <RHFTextField name="username" label={`${translate('common.username')}`} />
              <RHFTextField name="email" label="Email" disabled/>
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <RHFTextField name="about" multiline rows={4} label={`${translate('common.about')}`} />

              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {`${translate('common.save_changes')}`}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
