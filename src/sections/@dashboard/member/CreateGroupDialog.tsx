// react
import { useState } from 'react';
// @mui
import {
  Box,
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
// locales
import { useLocales } from 'src/locales';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// apis
import groupsApi from 'src/api/groupsApi';
import userclassesApi from 'src/api/userclassesApi';
// type
import { ICustomer } from 'src/shared/types/customer';
// type
import { IUser } from 'src/shared/types/user';
import { IUclass, IUclassReqCreate } from 'src/shared/types/uclass';
import { IGroupReqCreate } from 'src/shared/types/group';

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  open: boolean;
  uclass: IUclass | null;
  onClose: VoidFunction;
};

export default function CreateGroupDialog({
  open,
  uclass,
  onClose,
  ...other
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const [groupTitle, setGroupTitle] = useState<string>('');

  const onChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGroupTitle(event.target.value);
  };

  const addToGroup = async () => {
    if (uclass !== null) {
      const seluser: IUser = uclass.user as IUser;
      const newGroupReq: IGroupReqCreate = {
        customer: (uclass.customer as ICustomer)._id,
        groupname: seluser.username,
        logo: seluser.avatar,
        title: groupTitle,
        createdBy: user?.id,
      }
      const newGroup = await groupsApi.postCreate(newGroupReq);
      if (newGroup) {
        const updateData: IUclassReqCreate = {
          groupId: newGroup._id,
          groupName: newGroup.groupname,
          groupTitle: newGroup.title,
          isKey: true,
          updatedById: user?.id,
          updatedByName: user?.username,
        }
        await userclassesApi.updateById(uclass?._id, updateData);
      }
    }
    onClose();
  }

  const username = uclass ? (uclass?.user as IUser).username : '';

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle> {`${translate('nav.groups')} ${username}`} </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <TextField
            size='small'
            fullWidth
            label={`${translate('common.group_title')}`}
            onChange={onChangeTitle}
            sx={{
              textTransform: 'capitalize',
            }}
          >
          </TextField>

        </Stack>

      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ flexGrow: 1 }} />
        {onClose && (
          <Button variant="outlined" color="inherit" startIcon={<Iconify icon="material-symbols:cancel-outline" />} onClick={onClose}>
            {`${translate('common.cancel')}`}
          </Button>
        )}
        <Button variant='contained' startIcon={<Iconify icon="tabler:select" />} onClick={addToGroup}>
        {`${translate('common.add')}`}
        </Button>
      </DialogActions>

    </Dialog>
  );
}
