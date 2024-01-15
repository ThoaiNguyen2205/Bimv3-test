import { useState, useEffect, useMemo } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Alert,
  Box,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import FormProvider, { RHFTextField } from '../../../../components/hook-form';
import { ISystem, ISystemReqCreate, ISystemResGetAll } from 'src/shared/types/system';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/useAuthContext';
import { useLocales } from 'src/locales';
import ImageCard from './ImageCard';
import Scrollbar from '../../../../components/scrollbar';
// apis
import uploadsApi from 'src/api/uploadsApi';
import systemsApi from 'src/api/systemsApi';
// zustand store
import useSystem from 'src/redux/systemStore';
import { shallow } from 'zustand/shallow';
// type
import { IFilesRes } from 'src/shared/types/upload';
//
import UploadDialog from './UploadDialog';
// ----------------------------------------------------------------------

type FormValuesProps = {
  value: string,
  afterSubmit: boolean,
};

type ILocalState = {
  files: string[],
  showUpload: boolean,
}

interface Props extends DialogProps {
  isEdit: boolean;
  onClose: VoidFunction;
}

export default function SetImageDialog({ isEdit, onClose, ...other }: Props) {

  const { translate } = useLocales();
  const {
    setSystemVars,
    selectedSystemVar,
    setSelectedSystemVar,
  } = useSystem(
    (state) => ({ 
      setSystemVars: state.setDatas,
      selectedSystemVar: state.selectedData,
      setSelectedSystemVar: state.setSelectedData,
    }),
    shallow
  );

  const loadAllVariables = async () => {
    const apiRes: ISystemResGetAll = await systemsApi.getAlls();
    setSystemVars(apiRes.data);
  };

  const [localState, setLocalState] = useState<ILocalState>({
    files: [],
    showUpload: false,
  });

  const loadAllImages = async () => {
    const apiRes: IFilesRes = await uploadsApi.getAllFiles();
    setLocalState((prevState: ILocalState) => ({ ...prevState, files: apiRes.files }));
  };

  useEffect(() => {
    loadAllImages();
  }, []);

  const handlerShowUpload = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, showUpload: true }));
  }

  const handlerCloseUpload = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, showUpload: false }));
    loadAllImages();
  }

  const newCustomerSchema = Yup.object().shape({
    value: Yup.string().required(translate('superadmin.value_required')),
  });

  const defaultValues = useMemo(() => ({
    value: selectedSystemVar?.value || '',
  }), [selectedSystemVar]);

  useEffect(() => {
    if (isEdit && selectedSystemVar) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }    
  }, [isEdit, selectedSystemVar]);

  const handleResetFormData = () => {
    setSelectedSystemVar(null);
  }

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(newCustomerSchema),
    defaultValues,
  });

  const {
    setValue,
    reset,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const { user } = useAuthContext();

  const onSetImage = (file: string) => {
    setValue('value', file);
  }

  const onSubmit = async (data: FormValuesProps) => {
    const newSystemData: ISystemReqCreate = {
      value: data.value,
      createdBy: user?.id,
    }

    if (isEdit === true) {
      const updateSystemVar = await systemsApi.updateById((selectedSystemVar as ISystem)._id, newSystemData);
      if (updateSystemVar) {
        loadAllVariables();
      }
    } else {
      const newCustomer = await systemsApi.postCreate(newSystemData);
      if (newCustomer) {
        loadAllVariables();
      }
    }

    handleResetFormData();
    onClose();
    reset();
    
  };

  const onCancel = () => {
    onClose();
    reset();
  };

  return (
    <Dialog onClose={onClose} {...other} maxWidth={'xl'}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle> {isEdit ? `${translate('superadmin.system_variables')} ${selectedSystemVar?.name}` : `${translate('superadmin.new_system_variables')}`} </DialogTitle>

        <DialogContent>
          {!!errors.afterSubmit && <Alert severity="error" >{errors.afterSubmit.message}</Alert>}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <RHFTextField size='small' name="value" label={`${translate('common.value')}`} />
            <Button color="primary" variant="outlined" onClick={handlerShowUpload} sx={{ minWidth: 120 }} >
              {`${translate('common.upload')}`}
            </Button>
          </Stack>

          <Scrollbar sx={{ height: 350, width: '650px', mt: 2 }}>
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              }}
              gap={3}
              sx={{ mb: 2 }}
            >
              {localState.files
                .map((file) => (
                  <ImageCard
                    key={file}
                    file={file}
                    setImage={() => onSetImage(file)}
                  />
                ))}
            </Box>
          </Scrollbar>

        </DialogContent>

        <DialogActions>
          <Button color="error" variant="outlined" onClick={onCancel} startIcon={<Iconify icon='ooui:cancel'/>}>
            {`${translate('common.cancel')}`}
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting} startIcon={<Iconify icon='material-symbols:system-update-alt-rounded'/>}>
            {isEdit ? `${translate('common.modify')}` : `${translate('common.add')}`}
          </LoadingButton>
        </DialogActions>
        
      </FormProvider>

      <UploadDialog 
        open={localState.showUpload}
        onClose={handlerCloseUpload}
      />
    </Dialog>
  );
}
