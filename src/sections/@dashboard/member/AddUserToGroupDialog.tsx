// @mui
import {
  Box,
  Stack,
  Dialog,
  Button,
  MenuItem,
  TextField,
  DialogProps,
  DialogTitle,
  DialogActions,
  DialogContent,
  InputAdornment,
  List,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import groupsApi from 'src/api/groupsApi';
import { useAuthContext } from 'src/auth/useAuthContext';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
// locales
import { useLocales } from 'src/locales';
// zustand
import useGroup from 'src/redux/groupStore';
import { IGroup, IGroupResGetAll } from 'src/shared/types/group';
import { shallow } from 'zustand/shallow';
import GroupItem from './GroupItem';
import SelectGroupItem from './SelectGroupItem';
// ----------------------------------------------------------------------

type LocalState = {
  filterKey: string;
};

interface Props extends DialogProps {
  open: boolean;
  title: string;
  users: string[];
  loadAllUser: VoidFunction;
  onClose: VoidFunction;
};

export default function AddUserToGroupDialog({
  open,
  title,
  users,
  loadAllUser,
  onClose,
  ...other
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();

  const [localState, setLocalState] = useState<LocalState> ({
    filterKey: '',
  });

  const {
    groups,
    selectedGroup,
    setGroups,
    setSelectedGroup,
  } = useGroup(
    (state) => ({ 
      groups: state.datas,
      selectedGroup: state.selectedData,
      setGroups: state.setDatas,
      setSelectedGroup: state.setSelectedData,
    }),
    shallow
  );

  const dataFiltered = applyFilter({
    inputData: groups,
    filterKey: localState.filterKey,
  });

  const onSearchGroup = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: LocalState) => ({ ...prevState, filterKey: event.target.value }));
  };

  const loadAllGroup = useCallback(async () => {
    const apiRes: IGroupResGetAll = await groupsApi.getByCustomer(user?.customer._id);
    setGroups(apiRes.data);
  }, []);

  useEffect(() => {
    loadAllGroup();
  }, []);

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle> {`${translate('common.user')} ${title}`} </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <TextField
            size='small'
            fullWidth
            onChange={onSearchGroup}
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Scrollbar sx={{ mt: 1, height: 74 * 5 }}>
            <List disablePadding>
              {dataFiltered.map((group) => (
                <SelectGroupItem 
                  key={group._id}
                  group={group}
                  users={users}
                  loadAllUser={loadAllUser}
                  onClose={onClose}
                />
              ))}
            </List>
          </Scrollbar>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ flexGrow: 1 }} />
        {onClose && (
          <Button variant="outlined" color="inherit" startIcon={<Iconify icon="material-symbols:cancel-outline" />} onClick={onClose}>
            {`${translate('common.close')}`}
          </Button>
        )}
      </DialogActions>

    </Dialog>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  filterKey,
}: {
  inputData: IGroup[];
  filterKey: string;
}) {

  if (filterKey) {
    inputData = inputData.filter(
      (group) => group.groupname.toLowerCase().indexOf(filterKey.toLowerCase()) !== -1
    );
  }

  return inputData;
}