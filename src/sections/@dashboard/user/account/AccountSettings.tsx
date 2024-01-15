// form
import { useForm } from 'react-hook-form';
// @mui
import { 
  Box,
  Stack,
  Card,
  FormControlLabel,
  Paper,
  Grid,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form';
import Iconify from 'src/components/iconify/Iconify';

import { defaultSettings } from 'src/components/settings/config-setting';
import { useSettingsContext } from 'src/components/settings/SettingsContext';

import Block from 'src/components/settings/drawer/Block';
import BadgeDot from 'src/components/settings/drawer/BadgeDot';
import ModeOptions from 'src/components/settings/drawer/ModeOptions';
import LayoutOptions from 'src/components/settings/drawer/LayoutOptions';
import DirectionOptions from 'src/components/settings/drawer/DirectionOptions';
import { StyledCard } from 'src/components/settings/styles';
// locales
import { useLocales } from 'src/locales';
// auth
import { useAuthContext } from 'src/auth/useAuthContext';
// apis
import usersApi from 'src/api/usersApi';
// enum
import { DenseEnum } from 'src/shared/enums';
import { DataTableEnum } from 'src/shared/enums';
// type
import { IUserReqUpdate } from 'src/shared/types/user';
import { useEffect, useState } from 'react';
// ----------------------------------------------------------------------

type LocalState = {
  isDense: boolean;
  dataMode: string;
}

// ----------------------------------------------------------------------

export default function AccountSettings() {
  const { user, refresh } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const {
    themeMode,
    themeLayout,
    themeStretch,
    themeContrast,
    themeDirection,
    themeColorPresets,
    onResetSetting,
  } = useSettingsContext();

  const theme = useTheme();

  const [localState, setLocalState] = useState<LocalState>({
    isDense: false,
    dataMode: DataTableEnum.Table,
  });

  useEffect(() => {
    if (user?.dataMode === null || user?.dataMode === undefined || user?.dataMode === '' || user?.dataMode === DataTableEnum.Table) {
      setLocalState((prevState: LocalState) => ({ ...prevState, dataMode: DataTableEnum.Table }));
    } else {
      setLocalState((prevState: LocalState) => ({ ...prevState, dataMode: DataTableEnum.Grid }));
    }
    if (user?.denseMode === null || user?.denseMode === undefined || user?.denseMode === '' || user?.denseMode === DenseEnum.None) {
      setLocalState((prevState: LocalState) => ({ ...prevState, isDense: false }));
    } else {
      setLocalState((prevState: LocalState) => ({ ...prevState, isDense: true }));
    }
  }, [user]);

  const notDefault =
    themeMode !== defaultSettings.themeMode ||
    themeLayout !== defaultSettings.themeLayout ||
    themeStretch !== defaultSettings.themeStretch ||
    themeContrast !== defaultSettings.themeContrast ||
    themeDirection !== defaultSettings.themeDirection ||
    themeColorPresets !== defaultSettings.themeColorPresets;

  const defaultValues = {};

  const methods = useForm({ defaultValues });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onChangeDataMode = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: LocalState) => ({ ...prevState, dataMode: event.target.value }));
  }

  const onChangeDense = async () => {
    if (localState.isDense) {
      setLocalState((prevState: LocalState) => ({ ...prevState, isDense: false }));
    } else {
      setLocalState((prevState: LocalState) => ({ ...prevState, isDense: true }));
    }
  }

  const onSubmit = async () => {
    try {
      const updateData: IUserReqUpdate = {
        dataMode: localState.dataMode,
        denseMode: DenseEnum.Dense
      }
      if (localState.isDense === true) {
        updateData.denseMode = DenseEnum.Dense;
      } else {
        updateData.denseMode = DenseEnum.None;
      }
      await usersApi.updateById(user?.id, updateData);

      enqueueSnackbar(`${translate('user.update_user_success')}`, {variant: "success"});
      refresh(user?.id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ p: 3 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 5,
            width: 1,
            position: 'relative',
          }}
        >
          <Typography
            variant="overline"
            sx={{ mb: 3, display: 'block', color: 'text.secondary' }}
          >
            {`${translate('nav.interface')}`}
          </Typography>

          <Grid container spacing={5}>
            <Grid item xs={12} md={3}>
              <Block title={`${translate('nav.reset')}`} alignItems="center">
                <StyledCard key={'reset'} selected={themeLayout === themeLayout} sx={{ p: 3, width: 80 }} onClick={onResetSetting}>
                  <Box sx={{
                    position: 'relative',
                  }}>
                    {notDefault && <BadgeDot sx={{ mr: -3, mt: -2.7 }}/>}
                    <Iconify icon="ic:round-refresh" width={32} height={32}/>
                  </Box>
                </StyledCard>
              </Block>
            </Grid>
            <Grid item xs={12} md={3}>
              <Block
                title={`${translate('nav.mode')}`}
                alignItems="center"
              >
                <ModeOptions />
              </Block>
            </Grid>
            <Grid item xs={12} md={3}>
              <Block title={`${translate('nav.direction')}`}  alignItems="center">
                <DirectionOptions />
              </Block>
            </Grid>
            <Grid item xs={12} md={3}>
              <Block title={`${translate('nav.layout')}`}>
                <LayoutOptions />
              </Block>
            </Grid>
          </Grid>

          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <Block title={`${translate('common.data_mode')}`} sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                '& > *': { mx: 1 },
              }}>
                <RadioGroup row defaultValue={DataTableEnum.Table}>
                  <FormControlLabel value={DataTableEnum.Table} control={<Radio onChange={onChangeDataMode} checked={(localState.dataMode === DataTableEnum.Table) ? true : false}/>} label={`${translate('common.table')}`}/>
                  <FormControlLabel value={DataTableEnum.Grid} control={<Radio onChange={onChangeDataMode} checked={(localState.dataMode === DataTableEnum.Grid) ? true : false}/>} label={`${translate('common.grid')}`} />
                </RadioGroup>
              </Block>
            </Grid>
            <Grid item xs={12} md={6}>
              <Block
                title={`${translate('common.dense_mode')}`}
                alignItems="center"
              >
                <FormControlLabel label={`${translate('common.dense')}`} control={
                  <Switch checked={localState.isDense} onChange={onChangeDense} />
                } />
              </Block>
            </Grid>
          </Grid>
          
        </Paper>
        <Stack spacing={3} sx={{ pt: 5 }} alignItems="flex-end">
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} >
            {`${translate('common.save_changes')}`}
          </LoadingButton>
        </Stack>
      </Card>
    </FormProvider>
  );
}
