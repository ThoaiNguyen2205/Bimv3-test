import { useState, useEffect, useMemo } from 'react';
import * as Yup from 'yup';
// react-color
// @ts-ignore
import { TwitterPicker } from 'react-color';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Alert,
  Box,
  InputAdornment, 
  Stack,
  Button,
  Dialog,
  Typography,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
  Tooltip,
  StackProps,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// zustand store
import useForgeViewState from 'src/redux/forgeViewStore';
import { shallow } from 'zustand/shallow';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFSlider, RHFTextField } from '../../../components/hook-form';
import { useLocales } from 'src/locales';
// ----------------------------------------------------------------------

type ILocalState = {
  displayStrokeColorPicker: boolean;
  displayFillColorPicker: boolean;
  strokeColor: string;
  fillColor: string;
}

// ----------------------------------------------------------------------

type FormValuesProps = {
  strokeColor: string,
  fillColor: string,
  strokeOpacity: number,
  fillOpacity: number,
  strokeWidth: string,
  fontSize: string,
  afterSubmit: boolean,
};

interface Props extends DialogProps {
  open: boolean;
  setDefaultMarkupStyle: (isRestore: boolean) => void;
  onClose: VoidFunction;
}

export default function MarkupSettingsDialog({ open, setDefaultMarkupStyle, onClose, ...other }: Props) {
  const { translate } = useLocales();

  const {
    markupSettings,
    setMarkupSettings,
  } = useForgeViewState(
    (state) => ({
      markupSettings: state.markupSettings,
      setMarkupSettings: state.setMarkupSettings,
    }),
    shallow
  );
  
  const newTaskSchema = Yup.object().shape({
    strokeWidth: Yup.number().required(translate('task.name_required')),
    fontSize: Yup.number().required(translate('task.description_required')),
  });

  const defaultValues = useMemo(() => ({
    strokeColor: markupSettings?.strokeColor || '#00AB55',
    fillColor: markupSettings?.fillColor || '#00AB55',
    strokeOpacity: markupSettings?.strokeOpacity || 1.0,
    fillOpacity: markupSettings?.fillOpacity || 0.0,
    strokeWidth: markupSettings?.strokeWidth.toString() || '0.005',
    fontSize: markupSettings?.fontSize.toString() || '0.005',
  }), [markupSettings]);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(newTaskSchema),
    defaultValues,
  });

  const {
    reset,
    // control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    if (markupSettings) {
      setValue('strokeColor', markupSettings?.strokeColor);
      setValue('fillColor', markupSettings?.fillColor);
      setValue('strokeOpacity', markupSettings?.strokeOpacity);
      setValue('fillOpacity', markupSettings?.fillOpacity);
      setValue('strokeWidth', markupSettings?.strokeWidth.toString());
      setValue('fontSize', markupSettings?.fontSize.toString());
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        strokeColor: markupSettings?.strokeColor,
        fillColor: markupSettings?.fillColor,
      }));
    }
  }, [markupSettings]);

  const [localState, setLocalState] = useState<ILocalState>({
    displayStrokeColorPicker: false,
    displayFillColorPicker: false,
    strokeColor: '#00AB55',
    fillColor: '#00AB55',
  });

  const onSubmit = async (data: FormValuesProps) => {
    setMarkupSettings({
      strokeWidth: parseFloat(data.strokeWidth),
      strokeColor: localState.strokeColor,
      strokeOpacity: data.strokeOpacity,
      fillColor: localState.fillColor,
      fillOpacity: data.fillOpacity,
      fontSize: parseFloat(data.fontSize),
    });
    onClose();
    reset();
  };

  const onCancel = () => {
    onClose();
    reset();
  };

  const onRestore = () => {
    setDefaultMarkupStyle(true);
    onCancel();
  }

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle> {`${translate('coordinator.markup_settings')}`} </DialogTitle>

        <DialogContent sx={{ height: 1 }}>
          {!!errors.afterSubmit && <Alert severity="error" >{errors.afterSubmit.message}</Alert>}

          <Stack direction = {{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 5, ml: 2 }}>
            <Box>
              <Tooltip title={`${translate('coordinator.stroke_color')}`} placement='top'>
                <Box
                  onClick={() => {
                    setLocalState((prevState: ILocalState) => ({
                      ...prevState,
                      displayStrokeColorPicker: true,
                    }));
                  }}
                  sx={{
                    backgroundColor: localState.strokeColor,
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    borderRadius: '7px',
                    display: 'inline-block',
                    cursor: 'pointer',
                    color: localState?.strokeColor,
                    mr: 2,
                  }}
                />
              </Tooltip>
              {localState.displayStrokeColorPicker ? (
                <Box
                  sx={{
                    position: 'absolute',
                    zIndex: 20,
                  }}
                >
                  <Box
                    sx={{
                      position: 'fixed',
                      top: '0px',
                      right: '0px',
                      bottom: '0px',
                      left: '0px',
                    }}
                    onClick={() => {
                      setLocalState((prevState: ILocalState) => ({
                        ...prevState,
                        displayStrokeColorPicker: false,
                      }));
                    }}
                  />
                  <TwitterPicker
                    color={localState.strokeColor}
                    onChange={(e: any) => {
                      setLocalState((prevState: ILocalState) => ({
                        ...prevState,
                        strokeColor: e.hex,
                        displayStrokeColorPicker: false,
                      }));
                    }}
                  />
                </Box>
              ) : (
                <></>
              )}
            </Box>
            <Block label={`${translate('coordinator.stroke_opacity')}`} >
              <RHFSlider
                name="strokeOpacity"
                size="small"
                step={0.1}
                min={0}
                max={1}
                getAriaValueText={(value) => `${value}`}
                valueLabelFormat={(value) => `${value}`}
                sx={{ alignSelf: 'center', width: 300 }}
              />
            </Block>
            <RHFTextField
              size='small'
              name='strokeWidth'
              label={`${translate('coordinator.stroke_width')}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon='fluent:line-thickness-20-regular' width={24} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 200 }} 
            />
          </Stack>
          <Stack direction = {{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2, mb: 5, ml: 2 }}>
            <Box>
              <Tooltip title={`${translate('coordinator.fill_color')}`} placement='top'>
                <Box
                  onClick={() => {
                    setLocalState((prevState: ILocalState) => ({
                      ...prevState,
                      displayFillColorPicker: true,
                    }));
                  }}
                  sx={{
                    backgroundColor: localState?.fillColor,
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    borderRadius: '7px',
                    display: 'inline-block',
                    cursor: 'pointer',
                    color: localState?.fillColor,
                    mr: 2,
                  }}
                />
                </Tooltip>
              {localState.displayFillColorPicker ? (
                <Box
                  sx={{
                    position: 'absolute',
                    zIndex: 20,
                  }}
                >
                  <Box
                    sx={{
                      position: 'fixed',
                      top: '0px',
                      right: '0px',
                      bottom: '0px',
                      left: '0px',
                    }}
                    onClick={() => {
                      setLocalState((prevState: ILocalState) => ({
                        ...prevState,
                        displayFillColorPicker: false,
                      }));
                    }}
                  />
                  <TwitterPicker
                    color={markupSettings?.fillColor}
                    onChange={(e: any) => {
                      setLocalState((prevState: ILocalState) => ({
                        ...prevState,
                        fillColor: e.hex,
                        displayFillColorPicker: false,
                      }));
                      
                    }}
                  />
                </Box>
              ) : (
                <></>
              )}
            </Box>
            <Block label={`${translate('coordinator.fill_opacity')}`}>
              <RHFSlider
                title={`${translate('coordinator.fill_opacity')}`}
                name="fillOpacity"
                size="small"
                step={0.1}
                min={0}
                max={1}
                getAriaValueText={(value) => `${value}`}
                valueLabelFormat={(value) => `${value}`}
                sx={{ alignSelf: 'center', width: 300 }}
              />
            </Block>
            <RHFTextField
              size='small'
              name="fontSize"
              label={`${translate('coordinator.font_size')}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon='iconoir:font-size' width={24} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 200 }} 
            />
          </Stack>
          
        </DialogContent>

        <DialogActions>
          <Button
            color="inherit"
            variant="outlined"
            onClick={onRestore}
            startIcon={<Iconify icon="mdi:cursor-default-gesture-outline" />}
            sx={{ mr: 20 }}
          >
            {`${translate('nav.reset')}`}
          </Button>

          <Button color="inherit" variant="outlined" onClick={onCancel} startIcon={<Iconify icon="material-symbols:cancel-outline" />}>
            {`${translate('common.cancel')}`}
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting} startIcon={<Iconify icon="bxs:edit" />}>
            {`${translate('common.apply')}`}
          </LoadingButton>
        </DialogActions>
        
      </FormProvider>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

interface BlockProps extends StackProps {
  label?: string;
  children: React.ReactNode;
}

function Block({ label = 'RHFTextField', sx, children }: BlockProps) {
  return (
    <Stack spacing={1} sx={{ width: 1, ...sx }}>
      <Typography
        variant="caption"
        sx={{
          textAlign: 'left',
          fontStyle: 'italic',
        }}
      >
        {label}
      </Typography>
      {children}
    </Stack>
  );
}