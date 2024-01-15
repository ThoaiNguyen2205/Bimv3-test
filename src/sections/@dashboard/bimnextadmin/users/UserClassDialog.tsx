// react
import { useEffect, useState, useReducer, useCallback } from 'react';
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
import ConfirmDialog from 'src/components/confirm-dialog';
import UserClassItem from './UserClassItem';
// locales
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/useAuthContext';
// apis
import userclassesApi from 'src/api/userclassesApi';
import customersApi from 'src/api/customersApi';
// type
import { IUclass, IUclassReqCreate, IUclassResGetAll } from 'src/shared/types/uclass';
import { ICustomer, ICustomerResGetAll } from "src/shared/types/customer";
// enums
import { UserClassEnum } from 'src/shared/enums';
import { IUser } from 'src/shared/types/user';
import usersApi from 'src/api/usersApi';
// zustand
import useUser from 'src/redux/userStore';
import useCustomer from 'src/redux/customerStore';
import { shallow } from 'zustand/shallow';
import { DeleteData } from 'src/shared/types/deleteData';
// ----------------------------------------------------------------------

type LocalState = {
  permit: Array<{ label: string, value: string}>; 
  uClasses: Array<IUclass>;
  selectedUclassType: string;
  selectedUclass: IUclass | null;
}

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
};

export default function UserClassDialog({
  open,
  onClose,
  ...other
}: Props) {
  const { translate } = useLocales();
  const { user } = useAuthContext();

  const {
    selectedUser,
  } = useUser(
    (state) => ({ 
      selectedUser: state.selectedData,
    }),
    shallow
  );

  const {
    customers,
    setCustomers,
    selectedCustomer,
    setSelectedCustomer,
  } = useCustomer(
    (state) => ({ 
      customers: state.datas,
      selectedCustomer: state.selectedData,
      setCustomers: state.setDatas,
      setSelectedCustomer: state.setSelectedData,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<LocalState>({
    permit: [
      { label: UserClassEnum.Admin, value: UserClassEnum.Admin},
      { label: UserClassEnum.User, value: UserClassEnum.User},
    ],
    uClasses: [],
    selectedUclassType: '',
    selectedUclass: null,
  });

  useEffect(() => {
    const loadCustomers = async () => {
      const customersResponse: ICustomerResGetAll = await customersApi.getCustomer(null);
      const customers: Array<ICustomer> = customersResponse.data;
      setCustomers(customers);
      setSelectedCustomer(null);
    }
    loadCustomers();
  }, []);

  const loadUclasses = useCallback(async () => {
    const uclassesResponse: IUclassResGetAll = await userclassesApi.getUserClass({ userId: (selectedUser as IUser)?.id });
    const uclasses: Array<IUclass> = uclassesResponse.data;
    setLocalState((prevState: LocalState) => ({ ...prevState, uClasses: uclasses }));
  }, [selectedUser]);

  useEffect(() => {
    loadUclasses();
  }, [selectedUser]);

  const addNewClass = async() => {
    const newClass: IUclassReqCreate = {
      user: (selectedUser as IUser).id,
      customer: (selectedCustomer as ICustomer)._id,
      uclass: localState.selectedUclassType,
      expired: new Date(),
      updatedByName: user?.username,
      updatedById: user?.id,
    }
    
    // Add new
    const createNew = await userclassesApi.postCreate(newClass);
    if (createNew) {
      loadUclasses();
      setSelectedCustomer(null);
      setLocalState((prevState: LocalState) => ({ ...prevState, selectedUclassType: '' }));
    }
    
  }

  const [openConfirm, setOpenConfirm] = useState(false);

  const handleOpenConfirm = (id: string) => {
    const selectedUclassId = id;
    const selectedUclass = localState.uClasses.filter((value) => value._id === selectedUclassId)[0];
    setLocalState((prevState: LocalState) => ({ ...prevState, selectedUclass: selectedUclass }));
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const onDeleteUclass = async () => {
    if (localState.selectedUclass) {
      const uc_id = localState.selectedUclass._id;
      const userFromUC = localState.selectedUclass.user as IUser;
      const user_class = userFromUC.class;
      
      // Kiểm tra với trường hợp người dùng liên quan đang sử dụng uclass chuẩn bị xóa
      if (uc_id === user_class) {
        await usersApi.updateById(userFromUC._id, {
          class: null,
          customer: null,
          project: null,
        });
      }

      const deleteData: DeleteData = {
        deletedByName: user?.username,
        deletedById: user?.id,
      }
      const deleteClass = await userclassesApi.deleteById(localState.selectedUclass._id, deleteData);
      if (deleteClass) {
        loadUclasses();
      }
      
      handleCloseConfirm();
    }
  }

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle> {(selectedUser as IUser)?.username} </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Autocomplete
            fullWidth
            options={customers}
            getOptionLabel={(option) => option.shortName}
            renderInput={(params) => <TextField {...params} label={`${translate('common.customer')}`} margin="none" />}
            value={selectedCustomer}
            onChange={(event, newValue) => {
              if (newValue) {
                setSelectedCustomer(newValue);
              }
            }}
          />
          <Autocomplete
            fullWidth
            options={localState.permit}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => <TextField {...params} label={`${translate('common.permission')}`} margin="none" />}
            onChange={(event, newValue) => {
              if (newValue) {
                setLocalState((prevState: LocalState) => ({ ...prevState, selectedUclassType: newValue.value }));
              }
            }}
          />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant='contained' startIcon={<Iconify icon="fluent:accessibility-checkmark-20-regular" />} onClick={addNewClass}>
            {`${translate('common.add')}`}
          </Button>
        </Stack>

        {(localState.uClasses.length > 0) && (
          <Scrollbar sx={{ maxHeight: 60 * 6 }}>
            <List disablePadding>
              {localState.uClasses.map((uclass) => (
                <UserClassItem key={uclass._id} uclass={uclass} onDelete={handleOpenConfirm}/>
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
        title={`${localState.selectedUclass?.uclass} ${translate('common.of')} ${(localState.selectedUclass?.customer as ICustomer)?.shortName}`}
        content={`${translate('common.delete_confirm')}`}
        action={
          <Button variant="contained" color="error" onClick={onDeleteUclass}>
            {`${translate('common.delete')}`}
          </Button>
        }
      />

    </Dialog>
  );
}
