import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Alert,
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
// apis
import systemsApi from 'src/api/systemsApi';
// zustand store
import useSystem from 'src/redux/systemStore';
import { shallow } from 'zustand/shallow';

// ----------------------------------------------------------------------

type FormValuesProps = {
  name: string,
  afterSubmit: boolean,
};

interface Props extends DialogProps {
  isEdit: boolean;
  onClose: VoidFunction;
}

export default function NewSystemVarDialog({ isEdit, onClose, ...other }: Props) {

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
      setLoading: state.setLoading,
    }),
    shallow
  );

  const loadAllVariables = async () => {
    const apiRes: ISystemResGetAll = await systemsApi.getAlls();
    setSystemVars(apiRes.data);
  };

  const newCustomerSchema = Yup.object().shape({
    name: Yup.string().required(translate('superadmin.name_required')),
  });

  const defaultValues = useMemo(() => ({
      name: selectedSystemVar?.name || '',
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
    reset,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const { user } = useAuthContext();

  const onSubmit = async (data: FormValuesProps) => {
    const newSystemData: ISystemReqCreate = {
      name: data.name,
      value: '',
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
    <Dialog onClose={onClose} {...other} >
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle> {isEdit ? `${translate('superadmin.system_variables')} ${selectedSystemVar?.name}` : `${translate('superadmin.new_system_variables')}`} </DialogTitle>

        <DialogContent>
          {!!errors.afterSubmit && <Alert severity="error" >{errors.afterSubmit.message}</Alert>}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <RHFTextField name="name" label={`${translate('customers.name')}`} sx={{ minWidth: 300 }}/>
          </Stack>

        </DialogContent>

        <DialogActions>
          <Button color="error" variant="outlined" onClick={onCancel} startIcon={<Iconify icon='ooui:cancel'/>}>
            {`${translate('common.cancel')}`}
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            startIcon={<Iconify icon='material-symbols:system-update-alt-rounded'/>}
          >
            {isEdit ? `${translate('common.modify')}` : `${translate('common.add')}`}
          </LoadingButton>
        </DialogActions>
        
      </FormProvider>
    </Dialog>
  );
}
