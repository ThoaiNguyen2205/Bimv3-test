// react
import { useEffect, useState, useMemo, useCallback } from 'react';
// yup
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Box,
  List,
  Stack,
  Dialog,
  Button,
  Grid,
  TextField,
  DialogProps,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormHelperText
} from '@mui/material';
// import DatePicker from '@mui/lab/DatePicker';
import { DatePicker } from '@mui/x-date-pickers';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import ConfirmDialog from 'src/components/confirm-dialog';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import ContractItem from './ContractItem';
import { LoadingButton } from '@mui/lab';

// form
import { Controller, useForm } from 'react-hook-form';
// locales
import { useLocales } from 'src/locales';
// apis
import contractsApi from 'src/api/contractsApi';
// type
import { IContractReqCreate, IContract, IContractResGetAll } from 'src/shared/types/contract';
// Aut Context
import { useAuthContext } from 'src/auth/useAuthContext';
// zustand store
import useCustomer from 'src/redux/customerStore';
import { shallow } from 'zustand/shallow';

// ----------------------------------------------------------------------

type LocalState = {
  isEdit: boolean,
  currentContract: IContract | null,
  contracts: Array<IContract>,
  openConfirmDelete: boolean,
}

// ----------------------------------------------------------------------

type FormValuesProps = {
  contractcode: string,
  signeddate: Date | string,
  projectnumber: number,
  storage: number,
  forgecredit: number,
  users: number,
  expire: Date | string,
};

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
};

export default function CustomerContractDialog({
  open,
  onClose,
  ...other
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  // const { enqueueSnackbar } = useSnackbar();
  const { selectedCustomer } = useCustomer(
    (state) => ({ selectedCustomer: state.selectedData}),
    shallow
  );

  const [localState, setLocalState] = useState<LocalState>({
    isEdit: false,
    currentContract: null,
    contracts: [],
    openConfirmDelete: false,
  });

  const newContractSchema = Yup.object().shape({
    contractcode: Yup.string().required(translate('contracts.contractcode_required')),
    signeddate: Yup.string().required(translate('contracts.signeddate_required')),
    expire: Yup.string().required(translate('contracts.expire_required')),
  });

  const defaultValues = useMemo(() => ({
    contractcode: localState.currentContract?.contractCode || '',
    signeddate: localState.currentContract?.signedDate || '',
    projectnumber: localState.currentContract?.projectNumber || 3,
    storage: localState.currentContract?.storage || 10,
    forgecredit: localState.currentContract?.forgeCredit || 100,
    users: localState.currentContract?.users || 100,
    expire: localState.currentContract?.expire || '',
  }), [localState.currentContract]);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(newContractSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const loadContracts = useCallback(async () => {
    if (selectedCustomer !== null) {
      const params = { customer: selectedCustomer._id };
      console.log(params);
      
      const contractsResponse: IContractResGetAll = await contractsApi.getContract(params);
      console.log(contractsResponse);
      
      const contracts: Array<IContract> = contractsResponse.data;
      setLocalState((prevState: LocalState) => ({ ...prevState, contracts: contracts }));
    }
  }, [selectedCustomer]);

  useEffect(() => {
    loadContracts();
  }, [selectedCustomer]);

  useEffect(() => {
    reset(defaultValues);
  }, [localState.currentContract]);

  const handleResetFormData = () => {
    if (localState.isEdit) {
      setLocalState((prevState: LocalState) => ({ ...prevState, currentContract: null }));
      setLocalState((prevState: LocalState) => ({ ...prevState, isEdit: false }));
    } else {
      reset(defaultValues);
    }
  }

  const addNewContract = async (data: FormValuesProps) => {
    if (selectedCustomer !== null) {
      const newContract: IContractReqCreate = {
        contractCode: data.contractcode,
        customer: selectedCustomer._id,
        signedDate: data.signeddate as Date,
        projectNumber: data.projectnumber,
        storage: data.storage,
        forgeCredit: data.forgecredit,
        users: data.users,
        expire: data.expire as Date,
        createdBy: user?.id,
      }
      if (localState.isEdit) {
        await contractsApi.updateById(localState.currentContract?._id as string , newContract);
      } else {
        await contractsApi.postCreate(newContract);
      }
      loadContracts();
    }
    handleResetFormData();
  }

  const handleEditContract = (contract: IContract) => {
    setLocalState((prevState: LocalState) => ({ ...prevState, currentContract: contract }));
    setLocalState((prevState: LocalState) => ({ ...prevState, isEdit: true }));
  };

  const handleOpenConfirmDelete = (id: string) => {
    const selectedContractId = id;
    const selectedContract = localState.contracts.filter((value) => value._id === selectedContractId)[0];
    setLocalState((prevState: LocalState) => ({ ...prevState, currentContract: selectedContract }));
    setLocalState((prevState: LocalState) => ({ ...prevState, openConfirmDelete: true }));
  };

  const handleCloseConfirmDelete = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, openConfirmDelete: false }));
    setLocalState((prevState: LocalState) => ({ ...prevState, currentContract: null }));
    setLocalState((prevState: LocalState) => ({ ...prevState, isEdit: false }));
  };

  const onDeleteContract = async () => {
    if (localState.currentContract) {
      await contractsApi.removeById(localState.currentContract._id);
      loadContracts();
      handleCloseConfirmDelete();
    }
  }

  const onCloseDialog = () => {
    handleResetFormData();
    if (onClose) {
      onClose();
    }
  }

  return (
    <Dialog fullWidth open={open} onClose={onCloseDialog} {...other} maxWidth='md'>
      <FormProvider methods={methods} onSubmit={handleSubmit(addNewContract)}>
      <DialogTitle> {`${translate('common.customer')} ${selectedCustomer?.name}`} </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Grid container spacing={1} rowSpacing={3}>
          <Grid item xs={12} md={8}>
            <RHFTextField name="contractcode" label={`${translate('contracts.contract_code')}`} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="signeddate"
              render={({ field, fieldState: { error } }) => {
                if (error) {
                  field.value = error.message;
                }
                if (field.value === '') {
                  field.value = null;
                }
                return (
                  <div>
                    <DatePicker
                      label={`${translate('contracts.signed_date')}`}
                      value={field.value}
                      onChange={(newValue: Date | null) => {
                        field.onChange(newValue);
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                    {error && <FormHelperText className='Mui-error'>{error.message}</FormHelperText>}
                  </div>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <RHFTextField name="projectnumber" label={`${translate('contracts.project_number')}`} />
          </Grid>
          <Grid item xs={12} md={2}>
            <RHFTextField name="storage" label={`${translate('contracts.storage')}`} />
          </Grid>
          <Grid item xs={12} md={2}>
            <RHFTextField name="forgecredit" label={`${translate('contracts.forge_credit')}`} />
          </Grid>
          <Grid item xs={12} md={2}>
            <RHFTextField name="users" label={`${translate('contracts.users')}`} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="expire"
              render={({ field, fieldState: { error } }) => {
                if (error) {
                  field.value = error.message;
                }
                if (field.value === '') {
                  field.value = null;
                }
                return (
                  <div>
                    <DatePicker
                      label={`${translate('contracts.expire')}`}
                      value={field.value}
                      onChange={(newValue: Date | null) => {
                        field.onChange(newValue);
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                    {error && <FormHelperText className='Mui-error'>{error.message}</FormHelperText>}
                  </div>
                )
              }}
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2 }}>
          <Box sx={{ flexGrow: 1 }} />
          {localState.isEdit ? 
            <Button size="large" type="submit" variant="outlined" color='error' onClick={handleResetFormData}>
              {`${translate('common.cancel')}`}
            </Button>
            :
            <></>
          }
          <LoadingButton
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            startIcon={<Iconify icon='mdi:contract-outline'/>}
          >
            { localState.isEdit ? `${translate('common.modify')}` : `${translate('common.add')}` } 
          </LoadingButton>
        </Stack>

        {(localState.contracts?.length > 0) && (
          <Scrollbar sx={{ maxHeight: 60 * 6 }}>
            <List disablePadding>
              {localState.contracts.map((contract) => (
                <ContractItem key={contract._id} contract={contract} onDelete={handleOpenConfirmDelete} onEdit={handleEditContract}/>
              ))}
            </List>
          </Scrollbar>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" color="inherit" startIcon={<Iconify icon="mdi:exit-to-app" />} onClick={onCloseDialog}>
          {`${translate('common.close')}`}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={localState.openConfirmDelete}
        onClose={handleCloseConfirmDelete}
        title={`${localState.currentContract?.contractCode}`}
        content={`${translate('common.delete_confirm')}`}
        action={
          <Button variant="contained" color="error" onClick={onDeleteContract}>
            {`${translate('common.delete')}`}
          </Button>
        }
      />
      </FormProvider>
    </Dialog>
  );
}
