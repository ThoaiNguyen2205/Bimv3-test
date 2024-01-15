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
  Typography,
  LinearProgress,
} from '@mui/material';
import { TreeView, TreeItem, TreeItemProps, treeItemClasses, LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify';
import {
  emptyRows,
  TableProps,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../../components/table';
// locales
import { useLocales } from 'src/locales';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// apis
import userclassesApi from 'src/api/userclassesApi';
// type
import { IUclassReqCreate } from 'src/shared/types/uclass';
// zustand
import useUclass from 'src/redux/uclassStore';
import useGroup from 'src/redux/groupStore';
import { shallow } from 'zustand/shallow';
import { useState } from 'react';
import { DeleteData } from 'src/shared/types/deleteData';
import { IFileOrFolder } from 'src/shared/types/folder';
import foldersApi from 'src/api/foldersApi';
import filesApi from 'src/api/filesApi';
// ----------------------------------------------------------------------

type ILocalState = {
  isSubmitting: boolean,
  showProgress: boolean,
  eachProgress: number,
}

interface Props extends DialogProps {
  open: boolean;
  table: TableProps;
  tableData: IFileOrFolder[];
  onClose: VoidFunction;
};

export default function DeleteTrashesDialog({
  open,
  table,
  tableData,
  onClose,
  ...other
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();

  const [localState, setLocalState] = useState<ILocalState>({
    isSubmitting: false,
    showProgress: false,
    eachProgress: 0,
  });

  const deleteTrashes = async () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: true,
      showProgress: true,
    }));
    
    
    let total: number = 1; 
    const fileIds: string[] = [];
    const folderIds: string[] = [];
    for (const tid of table.selected) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        eachProgress: Math.round((100 * total) / (table.selected.length -1)),
      }));
      total++;
      const filter = tableData.filter((e) => e.data._id === tid);
      if (filter.length > 0) {
        const type = filter[0].type;
        if (type === 'folder') {
          folderIds.push(tid);
        }
        if (type === 'file') {
          fileIds.push(tid);
        }
      }
    }

    const deleteData: DeleteData = {
      deletedByName: user?.username,
      deletedById: user?.id,
    }

    let i: number = 1;
    for (const tid of fileIds) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        eachProgress: Math.round((100 * i) / (table.selected.length -1)),
      }));
      i++;
      await filesApi.deleteTrashById(tid, deleteData);
    }
    let j: number = i + 1;
    for (const tid of folderIds) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        eachProgress: Math.round((100 * j) / (table.selected.length -1)),
      }));
      j++;
      await filesApi.deleteTrashFolderById(tid, deleteData);
    }

    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: false,
      showProgress: false,
    }));
    onClose();
  }

  const onCancel = () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: false,
      showProgress: false,
    }));
    onClose();
  }

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle> {`${translate('cloud.delete_trash')} ${table.selected.length} ${translate('common.item')}`} </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Typography>
            {`${translate('cloud.delete_trash_folder_not')}`}
          </Typography>
          {localState.showProgress ?
          <Stack sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={localState.eachProgress} color="success" />
          </Stack>
          : 
          <></>
        }
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ flexGrow: 1 }} />
        {onCancel && (
          <Button variant="outlined" color="inherit" startIcon={<Iconify icon="material-symbols:cancel-outline" />} onClick={onCancel}>
            {`${translate('common.cancel')}`}
          </Button>
        )}

        <LoadingButton
          type="submit"
          variant="contained"
          color='error'
          loading={localState.isSubmitting}
          startIcon={<Iconify icon="tabler:trash-off" />}
          onClick={deleteTrashes}
        >
          {`${translate('common.delete')}`}
        </LoadingButton>
      </DialogActions>

    </Dialog>
  );
}
