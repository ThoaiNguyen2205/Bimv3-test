//react
import { useState } from 'react';
// @mui
import {
  Button,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify/Iconify';
import Label from '../../../components/label';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
} from '../../../components/table';
// Locales
import { useLocales } from 'src/locales';
// zustand store
import useFile from 'src/redux/filesStore';
import useForgeViewState from 'src/redux/forgeViewStore';
import { shallow } from 'zustand/shallow';
import forgeObjectsApi from 'src/api/forgeObjectsApi';
import { IForgeObjectData } from 'src/shared/types/forgeObject';
import EditModelInfo from './EditModelInfo';
// ----------------------------------------------------------------------

type ILocalState = {
  openEditDialog: boolean;
  selectedForgeData: IForgeObjectData | null;
  isSubmitting: boolean;
}

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
}

export default function ModelManager({ open, onClose, ...other }: Props) {
  const { translate } = useLocales();

  const TABLE_HEAD = [
    { id: 'name', label: `${translate('coordinator.model_name')}`, align: 'left', width: 280 },
    { id: 'order', label: `${translate('coordinator.model_order')}`, align: 'center', width: 100 },
    { id: 'show', label: `${translate('coordinator.model_show')}`, align: 'center', width: 100 },
    { id: 'xform', label: `${translate('coordinator.model_xform')}`, align: 'left', width: 120 },
    { id: '' },
  ];
  
  const {
    dense,
    order,
    orderBy,
  } = useTable();

  const {
    forgeObjectData,
  } = useForgeViewState(
    (state) => ({
      forgeObjectData: state.forgeObjectData,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    openEditDialog: false,
    selectedForgeData: null,
    isSubmitting: false,
  });

  const handleCloseEditDialog = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, openEditDialog: false, selectedForgeData: null }));
  };

  const onEditInfo = (fid: string) => {
    const filter = forgeObjectData.filter((e) => e.forgeObject._id === fid);
    if (filter.length > 0) {
      setLocalState((prevState: ILocalState) => ({ 
        ...prevState,
        selectedForgeData: filter[0],
        openEditDialog: true,
      }));
    }
  }

  const handleSaveStatus = async () => {
    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      isSubmitting: true,
    }));

    const promises = [];
    for (const fdai of forgeObjectData) {
      promises.push(forgeObjectsApi.updateById(
        fdai.forgeObject._id,
        { checked: fdai.forgeObject.checked}
      ));
    }
    await Promise.all(promises);

    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      isSubmitting: false,
    }));
    onClose();
  }

  const onCancel = () => {
    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      files: [],
      selectedFolder: null,
      selectedFiles: [],
    }));
    onClose();
  }

  return (
    <Dialog open={open} maxWidth='lg' onClose={onClose} {...other}>
      <DialogTitle> {`${translate('coordinator.model_manager')}`} </DialogTitle>

      <DialogContent sx={{ maxHeight: 400, minWidth: 400 }} >
        <TableContainer sx={{ position: 'relative', overflow: 'unset', width: '100%' }}>
          <Table size={dense ? 'small' : 'medium'} >
            <TableHeadCustom
              order={order}
              orderBy={orderBy}
              headLabel={TABLE_HEAD}
              rowCount={forgeObjectData.length}
              numSelected={forgeObjectData.length}
            />
                
            <TableBody>
              {forgeObjectData.map((row: IForgeObjectData) => (
                <TableRow hover key={row.forgeObject._id}>
                  <TableCell align="left">
                    <Typography variant="subtitle2" noWrap>
                      {row.forgeObject.displayName}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    {row.forgeObject.order || 0}
                  </TableCell> 

                  <TableCell align="center">
                    <Label
                      variant="soft"
                      color={(row.forgeObject.checked)  && 'success' || 'error'}
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {(row.forgeObject.checked)  && `${(translate('coordinator.show'))}` || `${(translate('coordinator.hide'))}`}
                    </Label>
                  </TableCell>

                  <TableCell align="left">
                    <Typography variant="subtitle2" noWrap>
                      {(row.forgeObject.xform === '') ?
                        '0 - 0 - 0' 
                        : 
                        `${JSON.parse(row.forgeObject.xform).x} - ${JSON.parse(row.forgeObject.xform).y} - ${JSON.parse(row.forgeObject.xform).z}`
                      }
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <IconButton color='primary' onClick={() => onEditInfo(row.forgeObject._id)}>
                      <Iconify icon="bx:edit" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              <TableNoData isNotFound={forgeObjectData.length < 1} />
            </TableBody>
                
          </Table>
        </TableContainer>

        <EditModelInfo
          selectedForgeData={localState.selectedForgeData}
          open={localState.openEditDialog}
          onClose={handleCloseEditDialog}
        />
      </DialogContent>

      <DialogActions>
        <Button
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="mdi:exit-to-app" />}
          onClick={onCancel}
        >
          {`${translate('common.cancel')}`}
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={localState.isSubmitting}
          startIcon={<Iconify icon="mdi:list-status" />}
          onClick={handleSaveStatus}
        >
          {`${translate('coordinator.save_show_hide_model')}`}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
