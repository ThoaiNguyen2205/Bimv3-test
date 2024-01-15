import { useState, useEffect, useCallback, useMemo } from 'react';
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
  LinearProgress,
  Typography,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify/Iconify';
import FormProvider, { RHFTextField } from '../../../../components/hook-form';
import { ICustomer, ICustomerReqCreate } from 'src/shared/types/customer';
import { UploadAvatar } from 'src/components/upload';

import { useAuthContext } from 'src/auth/useAuthContext';
import { useLocales } from 'src/locales';
// apis
import uploadsApi from 'src/api/uploadsApi';
import customersApi from 'src/api/customersApi';
// zustand store
import useCustomer from 'src/redux/customerStore';
import { shallow } from 'zustand/shallow';
import { useSnackbar } from 'notistack';

// ----------------------------------------------------------------------

type LocalState = {
  logoUrl: string;
  checkUpload: boolean;
  progress: number;
  progressShow: boolean;
}

// ----------------------------------------------------------------------

type FormValuesProps = {
  name: string,
  shortname: string,
  address: string,
  contactperson: string,
  contactemail: string,
  phone: string,
  taxcode: string,
  logo: string,
  afterSubmit: boolean,
};

interface Props extends DialogProps {
  isEdit: boolean;
  onClose: VoidFunction;
}

export default function NewCustomerDialog({ isEdit, onClose, ...other }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const { selectedCustomer, setSelectedCustomer, addCustomer, replaceCustomer } = useCustomer(
    (state) => ({ 
      selectedCustomer: state.selectedData,
      setSelectedCustomer: state.setSelectedData,
      addCustomer: state.addData,
      replaceCustomer: state.replaceData
    }),
    shallow
  );

  const newCustomerSchema = Yup.object().shape({
    name: Yup.string().required(translate('customers.name_required')),
    shortname: Yup.string().required(translate('customers.shortname_required')),
    contactemail: Yup.string().required(translate('customers.email_required')),
  });

  const defaultValues = useMemo(() => ({
      name: selectedCustomer?.name || '',
      shortname: selectedCustomer?.shortName || '',
      address: selectedCustomer?.address || '',
      contactperson: selectedCustomer?.contactPerson || '',
      contactemail: selectedCustomer?.contactEmail || '',
      phone: selectedCustomer?.phone || '',
      taxcode: selectedCustomer?.taxCode || '',
      logo: selectedCustomer?.logo || 'comlogo.png'
  }), [selectedCustomer]);

  const [localState, setLocalState] = useState<LocalState>({
    logoUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.logo}`,
    checkUpload: false,
    progress: 0,
    progressShow: false,
  });

  useEffect(() => {
    if (isEdit && selectedCustomer) {
      reset(defaultValues);
      setLocalState((prevState: LocalState) => ({ ...prevState, logoUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.logo}` }));
    }
    if (!isEdit) {
      reset(defaultValues);
    }    
  }, [isEdit, selectedCustomer]);

  const handleResetFormData = () => {
    setSelectedCustomer(null);
    setLocalState((prevState: LocalState) => ({ 
      ...prevState,
      isEdit: false,
      logoUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.logo}`,
    }));
  }

  const handleDropAvatar = useCallback((acceptedFiles: any) => {
    const newLogo = acceptedFiles[0];
    const name = newLogo.name;
    const ext = name.slice(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() === 'png' || ext.toLowerCase() === 'jpg' || ext.toLowerCase() === 'webp') {
      if (newLogo) {
        setLocalState((prevState: LocalState) => ({ 
          ...prevState,
          logoUrl: Object.assign(newLogo, { preview: URL.createObjectURL(newLogo), }),
          checkUpload: true,
        }));
      }
    } else {
      enqueueSnackbar(`${translate('helps.accepted_image')}`, {variant: "warning"});
    }
  }, []);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(newCustomerSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const { user } = useAuthContext();

  const onSubmit = async (data: FormValuesProps) => {
    const newCustomerData: ICustomerReqCreate = {
      address: data.address,
      contactEmail: data.contactemail,
      contactPerson: data.contactperson,
      createdBy: user?.id,
      logo: data.logo,
      name: data.name,
      phone: data.phone,
      shortName: data.shortname,
      taxCode: data.taxcode,
    }
    if (localState.checkUpload) {
      setLocalState((prevState: LocalState) => ({ ...prevState, progressShow: true }));
      
      const formData = new FormData(); 
      formData.append("image", localState.logoUrl);
      const onUploadProgress = (e: any) => {
        setLocalState((prevState: LocalState) => ({ ...prevState, progress: Math.round((100 * e.loaded) / e.total) }));
      };
      const ufileResponse = await uploadsApi.uploadImage(formData, onUploadProgress);

      newCustomerData.logo = ufileResponse.filename;
      setLocalState((prevState: LocalState) => ({ ...prevState, progressShow: false, checkUpload: false }));
    }

    if (isEdit === true) {
      const updateCustomer = await customersApi.updateById((selectedCustomer as ICustomer)._id, newCustomerData);
      if (updateCustomer) {
        replaceCustomer(updateCustomer);
      }
    } else {
      const newCustomer = await customersApi.postCreate(newCustomerData);
      if (newCustomer) {
        addCustomer(newCustomer);
      }
    }

    handleResetFormData();
    onClose();
    reset(defaultValues);
    // reset();
    
  };

  const onCancel = () => {
    onClose();
    reset(defaultValues);
    // reset();
  };

  return (
    <Dialog onClose={onClose} {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle> {isEdit ? `${translate('customers.customer')} ${selectedCustomer?.shortName}` : `${translate('customers.new_customer')}`} </DialogTitle>

        <DialogContent>
          {!!errors.afterSubmit && <Alert severity="error" >{errors.afterSubmit.message}</Alert>}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
            <RHFTextField name="name" size='small' label={`${translate('customers.name')}`} />
            <RHFTextField name="shortname" size='small' label={`${translate('customers.short_name')}`} />
          </Stack>

          <RHFTextField name="address" size='small' label={`${translate('customers.address')}`} sx={{ mt: 1 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
            <RHFTextField name="contactperson" size='small' label={`${translate('customers.contact_person')}`} />
            <RHFTextField name="contactemail" size='small' label={`${translate('customers.email')}`} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
            <RHFTextField name="phone" size='small' label={`${translate('customers.phone')}`} />
            <RHFTextField name="taxcode" size='small' label={`${translate('customers.taxcode')}`} />
          </Stack>

          <Box sx={{ mt: 5 }} >
            <UploadAvatar
              file={localState.logoUrl}
              onDrop={handleDropAvatar}
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
            />
            {localState.progressShow ? <LinearProgress variant="determinate" value={localState.progress} color="success" /> : null}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onCancel}>
            {`${translate('common.cancel')}`}
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            startIcon={<Iconify icon='ic:twotone-add-chart'/>}
          >
            {isEdit ? `${translate('common.modify')}` : `${translate('common.add')}`}
          </LoadingButton>
        </DialogActions>
        
      </FormProvider>
    </Dialog>
  );
}
