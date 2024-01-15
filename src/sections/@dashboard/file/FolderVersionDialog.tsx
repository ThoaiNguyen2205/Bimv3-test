//react 
import React, { useState } from 'react';
// @mui
import {
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Radio,
  Container,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { TreeView, TreeItem, TreeItemProps, treeItemClasses, LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify/Iconify';
import Scrollbar from 'src/components/scrollbar/Scrollbar';
import { useSnackbar } from 'src/components/snackbar';
// Locales
import { useLocales } from 'src/locales';
// zustand store
import useFolder from 'src/redux/foldersStore';
import { shallow } from 'zustand/shallow';
// enums
import { TransferType } from 'src/shared/enums';
// sections
import GroupTransferList from '../groups-transfer/GroupTransferList';
import { useAuthContext } from 'src/auth/useAuthContext';
import foldersApi from 'src/api/foldersApi';
import filesApi from 'src/api/filesApi';
import { IFolder, IFolderReqCreate } from 'src/shared/types/folder';
// ----------------------------------------------------------------------

type ILocalState = {
  isSubmitting: boolean,
  value: string,
}

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
  renameFolder: IFolder | null;
  onLoadFolders: (folderId: string) => void;
}

export default function FolderVersionDialog({ open, onClose, renameFolder, onLoadFolders, ...other }: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();

  const {
    selectedFolder,
  } = useFolder(
    (state) => ({ 
      selectedFolder: state.selectedData,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    isSubmitting: false,
    value: 'n',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, value: event.target.value }));
  };

  const onSubmit = async () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, isSubmitting: true }));
    const verChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (renameFolder === null) return;

    const oldVersionFull = renameFolder.version;
    let oldPrefix = oldVersionFull.slice(0, 1);
    let oldNumber = oldVersionFull.slice(1);
    if (localState.value === 'p') {
      oldPrefix = verChar.charAt(verChar.indexOf(oldPrefix) + 1);
      oldNumber = '01';
    } else {
      const vernumber = parseInt(oldNumber) + 1;
      if (vernumber < 10) {
        oldNumber = '0' + vernumber.toString();
      } else {
        oldNumber = vernumber.toString();
      }
    }

    const updateData: IFolderReqCreate = {
      version: oldPrefix + oldNumber,
      updatedName: user?.username,
      updatedId: user?.id,
    }
    
    // dùng lại sau khi kiểm tra xong
    const updateResponse = await foldersApi.updateById(renameFolder._id, updateData);

    // 2. update dữ liệu các file mới nhất trong folder:
    const param = {
      folder: renameFolder._id,
    }
    const fileRes = await filesApi.getAllLastedFilesInFolder(param);
    for (const fi of fileRes) {
      const updateFile = {
        version: updateResponse.version,
        subVersion: '01'
      }
      await filesApi.updateById(fi._id, updateFile);
    }

    enqueueSnackbar(`${translate('cloud.updated_folder_successfull')}`, { variant: 'info' });

    setLocalState((prevState: ILocalState) => ({ ...prevState, isSubmitting: false }));

    if (selectedFolder !== null) {
      onLoadFolders(selectedFolder._id);
    }
    onClose();
  };

  return (
    <Dialog maxWidth="sm" open={open} onClose={onClose} {...other}>
        <DialogTitle> {`${translate('cloud.version')} ${renameFolder?.displayName}`} </DialogTitle>

        <DialogContent>
          <Typography sx={{paddingBottom: '20px'}}>
            {`${translate('cloud.levelup')}`}
          </Typography>
          <Stack sx={{ paddingBottom: '50px'}}>
            <FormControl component="fieldset">
              <RadioGroup row defaultValue="n" value={localState.value} onChange={handleChange}>
                <FormControlLabel value="p" control={<Radio />} label={`${translate('cloud.prefix')}`} sx={{paddingRight: '50px'}} />
                <FormControlLabel value="n" control={<Radio />} label={`${translate('cloud.number')}`} />
              </RadioGroup>
            </FormControl>
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="mdi:exit-to-app" />}
            onClick={onClose}
          >
            {`${translate('common.cancel')}`}
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={localState.isSubmitting}
            startIcon={<Iconify icon="carbon:folder-move-to" />}
            onClick={onSubmit}
          >
            {`${translate('cloud.update')}`}
          </LoadingButton>
        </DialogActions>
    </Dialog>
  );
}
