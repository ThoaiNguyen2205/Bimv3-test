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
import { IForgeObjectData, IForgeObjectReqCreate } from 'src/shared/types/forgeObject';
import forgeObjectsApi from 'src/api/forgeObjectsApi';

// ----------------------------------------------------------------------

type FormValuesProps = {
  order: number,
  x: number,
  y: number,
  z: number,
  afterSubmit: boolean,
};

interface Props extends DialogProps {
  selectedForgeData: IForgeObjectData | null;
  open: boolean;
  onClose: VoidFunction;
}

export default function EditModelInfo({ selectedForgeData, open, onClose, ...other }: Props) {
  const { translate } = useLocales();

  const {
    forgeLoading,
    setForgeLoading,
    currentTask,
    setCurrentTask,
    forgeObjectData,
    setForgeObjectData,
    firstObject,
    setFirstObject,
    selectedObject,
    setSelectedObject,
  } = useForgeViewState(
    (state) => ({
      forgeLoading: state.forgeLoading,
      setForgeLoading: state.setForgeLoading,
      currentTask: state.currentTask,
      setCurrentTask: state.setCurrentTask,
      forgeObjectData: state.forgeObjectData,
      setForgeObjectData: state.setForgeObjectData,
      firstObject: state.firstObject,
      setFirstObject: state.setFirstObject,
      selectedObject: state.selectedObject,
      setSelectedObject: state.setSelectedObject,
    }),
    shallow
  );
  
  const newTaskSchema = Yup.object().shape({
    order: Yup.number().required(translate('task.name_required')),
    x: Yup.number().required(translate('task.description_required')),
    y: Yup.number().required(translate('task.description_required')),
    z: Yup.number().required(translate('task.description_required')),
  });

  const defaultValues = useMemo(() => ({
    order: 0,
    x: 0,
    y: 0,
    z: 0,
  }), []);

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
    if (selectedForgeData !== undefined && selectedForgeData !== null) {
      setValue('order', selectedForgeData?.forgeObject.order ?  selectedForgeData?.forgeObject.order : 0);
      if (selectedForgeData.forgeObject.xform !== '') {
        const xform = JSON.parse(selectedForgeData.forgeObject.xform);
        setValue('x', xform.x);
        setValue('y', xform.y);
        setValue('z', xform.z);
      }
    }
  }, [selectedForgeData]);

  const onSubmit = async (data: FormValuesProps) => {
    // console.log(data);
    let updateData: IForgeObjectReqCreate = {};
    if (data.order !== 0) {
      updateData.order = data.order;
    }
    updateData.xform = JSON.stringify({ x: data.x, y: data.y, z: data.z });
    if (selectedForgeData !== null) {
      const newForgeObject = await forgeObjectsApi.updateById(selectedForgeData.forgeObject._id, updateData);
      // thay thế trong tập hợp đã có
      const newForgeData: IForgeObjectData[] = [];
      for (const fdai of forgeObjectData) {
        if (fdai.forgeObject._id === selectedForgeData.forgeObject._id) {
          newForgeObject.checked = fdai.forgeObject.checked;
          fdai.forgeObject = newForgeObject;
        }
        newForgeData.push(fdai);
      }
      setForgeObjectData(newForgeData);
    }
    
    onClose();
    reset();
  };

  const onCancel = () => {
    onClose();
    reset();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle> {`${translate('coordinator.markup_settings')}`} </DialogTitle>

        <DialogContent sx={{ height: 1 }}>
          {!!errors.afterSubmit && <Alert severity="error" >{errors.afterSubmit.message}</Alert>}

          <Stack direction = {{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2, mb: 5, ml: 2 }}>
            <RHFTextField
              size='small'
              name="order"
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
            <RHFTextField
              size='small'
              name="x"
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
            <RHFTextField
              size='small'
              name="y"
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
            <RHFTextField
              size='small'
              name="z"
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
