import { useState } from 'react';
// @mui
import {
  Box,
  Stack,
  Dialog,
  Button,
  DialogProps,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  LinearProgress,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify';
import {
  TableProps,
} from '../../../components/table';
// locales
import { useLocales } from 'src/locales';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// apis
import foldersApi from 'src/api/foldersApi';
import filesApi from 'src/api/filesApi';
// type
import { DeleteData } from 'src/shared/types/deleteData';
import { IFileOrFolder } from 'src/shared/types/folder';
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

export default function DeleteItemsDialog({
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

  const deleteFileManagerItems = async () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: true,
      showProgress: true,
    }));

    const deleteData: DeleteData = {
      deletedByName: user?.username,
      deletedById: user?.id,
    }

    let i: number = 1; 

    for (const tid of table.selected) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        eachProgress: Math.round((100 * i) / (tableData.length -1)),
      }));
      i++;
      const filter = tableData.filter((e) => e.data._id === tid);
      if (filter.length > 0) {
        const type = filter[0].type;
        if (type === 'folder') {
          await foldersApi.deleteById(tid, deleteData);
        }
        if (type === 'file') {
          await filesApi.deleteById(tid, deleteData);
        }
      }
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
      <DialogTitle> {`${translate('cloud.delete')} ${table.selected.length} ${translate('common.item')}`} </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Typography>
            {`${translate('common.delete_confirm')}`}
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
          startIcon={<Iconify icon="material-symbols:delete-outline" />}
          onClick={deleteFileManagerItems}
        >
          {`${translate('common.delete')}`}
        </LoadingButton>
      </DialogActions>

    </Dialog>
  );
}
