// react
import { useEffect, useState, useCallback } from 'react';
// @mui
import {
  Autocomplete,
  Box,
  List,
  Stack,
  Dialog,
  Button,
  TextField,
  DialogProps,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import ConfirmDialog from 'src/components/confirm-dialog';
import AppItem from './AppItem';
// locales
import { useLocales } from 'src/locales';
// apis
import userclassesApi from 'src/api/userclassesApi';
import customersApi from 'src/api/customersApi';
import bimnextAppsApi from 'src/api/bimnextAppsApi';
// type
import { IBimnextAppReqCreate, IBimnextApp, IBimnextAppResGetAll } from 'src/shared/types/bimnextApp';
// enums
import { UserClassEnum } from 'src/shared/enums';
import NAV_ICONS from 'src/layouts/dashboard/nav/navIcon';
import { AppIMEI } from 'src/shared/enums';

import { useAuthContext } from 'src/auth/useAuthContext';
// zustand store
import useCustomer from 'src/redux/customerStore';
import { shallow } from 'zustand/shallow';

// ----------------------------------------------------------------------
export const APP_LIST = [
  { AppIMEI: AppIMEI.Cloud },
  { AppIMEI: AppIMEI.Coordination },
  { AppIMEI: AppIMEI.TakeOff },
  { AppIMEI: AppIMEI.Schedule },
  { AppIMEI: AppIMEI.MethodStatement },
  { AppIMEI: AppIMEI.Sheet },
  { AppIMEI: AppIMEI.Report360 },
  { AppIMEI: AppIMEI.PointCloud },
  { AppIMEI: AppIMEI.ProjectHistory },
  { AppIMEI: AppIMEI.CombineData },
] as const;

// ----------------------------------------------------------------------

type LocalState = {
  selectedImei: string;
  selectedApp: IBimnextApp | null; 
  apps: Array<IBimnextApp>;
}

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
};

export default function CustomerAppsDialog({
  open,
  onClose,
  ...other
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCustomer } = useCustomer(
    (state) => ({ selectedCustomer: state.selectedData}),
    shallow
  );

  const [localState, setLocalState] = useState<LocalState>({
    selectedImei: '',
    selectedApp: null,
    apps: [],
  });

  const loadApps = useCallback(async () => {
    if (selectedCustomer !== null) {
      const appsResponse: IBimnextAppResGetAll = await bimnextAppsApi.getByCustomer(selectedCustomer._id);
      const apps: Array<IBimnextApp> = appsResponse.data;
      setLocalState((prevState: LocalState) => ({ ...prevState, apps: apps }));
    }
  }, [selectedCustomer]);

  useEffect(() => {
    loadApps();
  }, [selectedCustomer]);

  const addNewApp = async() => {
    if (selectedCustomer !== null) {
      const newApp: IBimnextAppReqCreate = {
        AppIMEI: localState.selectedImei,
        customer: selectedCustomer._id,
        createdBy: user?.id,
      }

      if (localState.apps.filter(app => app.AppIMEI === localState.selectedImei).length > 0) {
        enqueueSnackbar(`${translate('superadmin.app_existing')}`, {variant: "warning"});
        return;
      }
      
      // Add new
      const createNew = await bimnextAppsApi.postCreate(newApp);
      if (createNew) {
        loadApps();
      }
    }    
  }

  const [openConfirm, setOpenConfirm] = useState(false);

  const handleOpenConfirm = (id: string) => {
    const selectedAppId = id;
    const selectedApp = localState.apps.filter((value) => value._id === selectedAppId)[0];
    setLocalState((prevState: LocalState) => ({ ...prevState, selectedApp: selectedApp }));
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const onDeleteApp = async () => {
    if (localState.selectedApp) {
      const deleteApp = await bimnextAppsApi.removeById(localState.selectedApp._id);
      if (deleteApp) {
        loadApps();
        handleCloseConfirm();
      }
    }
  }

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle> {`${translate('common.customer')} ${selectedCustomer?.name}`} </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Autocomplete
            fullWidth
            options={APP_LIST}
            getOptionLabel={(option) => option.AppIMEI}
            renderInput={(params) => <TextField {...params} label={`${translate('superadmin.app')}`} margin="none" />}
            onChange={(event, newValue) => {
              if (newValue) {
                setLocalState((prevState: LocalState) => ({ ...prevState, selectedImei: newValue.AppIMEI }));
              }
            }}
          />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant='contained' startIcon={<Iconify icon="fluent:form-new-48-filled" />} onClick={addNewApp}>
            {`${translate('common.add')}`}
          </Button>
        </Stack>

        {(localState.apps?.length > 0) && (
          <Scrollbar sx={{ maxHeight: 60 * 6 }}>
            <List disablePadding>
              {localState.apps.map((app) => (
                <AppItem key={app.AppIMEI} app={app} onDelete={handleOpenConfirm}/>
              ))}
            </List>
          </Scrollbar>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ flexGrow: 1 }} />
        {onClose && (
          <Button variant="outlined" color="inherit" startIcon={<Iconify icon="mdi:exit-to-app" />} onClick={onClose}>
            {`${translate('common.close')}`}
          </Button>
        )}
      </DialogActions>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title={`${localState.selectedApp?.AppIMEI}`}
        content={`${translate('common.delete_confirm')}`}
        action={
          <Button variant="contained" color="error" onClick={onDeleteApp}>
            {`${translate('common.delete')}`}
          </Button>
        }
      />

    </Dialog>
  );
}
