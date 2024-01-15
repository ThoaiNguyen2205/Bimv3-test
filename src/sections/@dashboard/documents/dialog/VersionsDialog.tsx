import { useState, useEffect } from 'react';
// @mui
import {
  Box,
  Card,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody
} from '@mui/material';
// components
import { useSnackbar } from '../../../../components/snackbar';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableEmptyRows,
  emptyRows
} from '../../../../components/table';
import Iconify from '../../../../components/iconify';
// AuthContext
import { useAuthContext } from '../../../../auth/useAuthContext';
// Locales
import { useLocales } from '../../../../locales';
// zustand store
import useBimDocument from '../../../../redux/bimDocumentStore';
import { shallow } from 'zustand/shallow';
// enums
import { DenseEnum } from '../../../../shared/enums';
// type
import { IDocContent } from '../../../../shared/types/docContent';
import { ConfirmDialogProps } from '../../../../components/confirm-dialog/types';
//apis
import docContentsApi from '../../../../api/docContentsApi';
import usersInDocumentsApi from '../../../../api/usersInDocumentsApi';
import _ from 'lodash';
// sections
import VersionPreview, { IPreviewDialogProps } from './VersionPreview';
import ConfirmDialog from '../../../../components/confirm-dialog/ConfirmDialog';
import UsersInDocTableRow from '../UsersInDocTableRow';

// ------------------------------------------------------

type ILocalState = {
  dataDialog: ConfirmDialogProps;
  dataPreviewDialog: IPreviewDialogProps;
};

type Props = {
  open: boolean;
  onClose: VoidFunction;
  title: string;
  index: string;
  docVersions: IDocContent[];
  getVersions: () => Promise<void>;
  idIndex: string;
  handleReturnVersion: () => Promise<void>;
};
export default function VersionsDialog({
  handleReturnVersion,
  idIndex,
  open,
  onClose,
  docVersions,
  getVersions,
  index,
  title
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const [localState, setLocalState] = useState<ILocalState>({
    dataDialog: {
      open: false,
      onClose: () => {},
      title: ''
    },
    dataPreviewDialog: {
      open: false,
      onClose: () => {},
      version: null
    }
  });
  const TABLE_HEAD = [
    {
      id: 'versions',
      label: `${translate('documents.versions')}`,
      align: 'center',
      width: 150
    },
    {
      id: 'title',
      label: `${translate('documents.title')}`,
      align: 'center',
      width: 300
    },
    {
      id: 'createBy',
      label: `${translate('customers.createby')}`,
      align: 'center',
      width: 200
    },
    {
      id: 'createAt',
      label: `${translate('common.created_at')}`,
      align: 'center',
      width: 200
    },
    { id: 'action', label: '', align: 'center', width: 100 }
  ];
  const {
    dense,
    page,
    rowsPerPage,
    //
    setDense,
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage
  } = useTable({
    defaultOrderBy: 'createdAt'
  });
  const {
    order,
    orderBy,
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows
  } = useTable();
  const { selectedDocument } = useBimDocument(
    (state) => ({
      selectedDocument: state.selectedData
    }),
    shallow
  );
  const isNotFound = !docVersions.length;
  const denseHeight = dense ? 52 : 72;
  useEffect(() => {
    const loadUsersInDocument = async () => {
      if (selectedDocument !== null) {
        const param = {
          document: selectedDocument._id
        };
        const res = await usersInDocumentsApi.getUsersInDocument(param);
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          users: res.data
        }));
      }
    };
    loadUsersInDocument();
  }, [selectedDocument]);

  useEffect(() => {
    if (idIndex) {
      getVersions();
    }
  }, [, idIndex]);
  /*============HANDLE API============ */
  // handle delete version
  const handleDeleteVersion = async (idVersion: string, title: string) => {
    await docContentsApi.deleteById(idVersion);
    handleOpenDeleteVersion(null, title);
    getVersions();
    handleReturnVersion();
  };
  /*=============HANDLE LOCAL============= */
  //handle open dialog delete version
  const handleOpenDeleteVersion = (idVersion: string | null, title: string) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleOpenDeleteVersion(null, title)
    };
    if (idVersion === null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        dataDialog
      }));
      return;
    }
    dataDialog = {
      open: true,
      onClose: () => handleOpenDeleteVersion(null, title),
      title: `${translate('documents.versions')}: ${title}`,
      content: `${translate('common.delete_confirm')}`,
      action: (
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDeleteVersion(idVersion, title);
            enqueueSnackbar(`${translate('documents.delete_success')}`, {
              variant: 'success'
            });
          }}>
          {`${translate('common.delete')}`}
        </Button>
      )
    };
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      dataDialog
    }));
  };
  // handle open dialog preview
  const handleOpenPreviewDialog = (version: IDocContent | null) => {
    let dataPreviewDialog: IPreviewDialogProps = {
      open: false,
      onClose: () => handleOpenPreviewDialog(null)
    };
    if (version === null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        dataPreviewDialog
      }));
      return;
    }
    dataPreviewDialog = {
      open: true,
      onClose: () => handleOpenPreviewDialog(null),
      version
    };
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      dataPreviewDialog
    }));
  };
  useEffect(() => {
    if (user !== null) {
      if (user.denseMode === DenseEnum.Dense) {
        setDense(true);
      } else {
        setDense(false);
      }
    }
  }, [user]);

  return (
    <>
      <Dialog
        className="version-dialog"
        fullWidth
        maxWidth="xl"
        open={open}
        onClose={onClose}>
        <DialogTitle className="version-dialog__title">
          <Box className="version-dialog__title-category">{title}</Box>
          <Box className="version-dialog__title-icon" />
          <Box className="version-dialog__title-document">{index}</Box>
        </DialogTitle>

        <DialogContent className="version-dialog__content">
          <Card className="version-dialog__content-card item-card">
            <CardHeader
              className="item-card__header"
              title={`${translate('documents.version_list')}`}
            />
            <Box className="item-card__body">
              <Table
                className="item-card__body-table table"
                size={dense ? 'small' : 'medium'}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={docVersions.length}
                  onSort={onSort}
                  sx={{
                    '& .MuiTableCell-head': {
                      bgcolor: 'transparent'
                    }
                  }}
                />
                <TableBody className="table__body">
                  {docVersions.map((row) => (
                    <UsersInDocTableRow
                      row={row}
                      deleteVersion={handleOpenDeleteVersion}
                      handleOpenPreviewDialog={handleOpenPreviewDialog}
                    />
                  ))}
                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(page, rowsPerPage, docVersions.length)}
                  />
                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </Box>
          </Card>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end' }}>
          {
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="mdi:exit-to-app" />}
              onClick={onClose}>
              {`${translate('common.close')}`}
            </Button>
          }
        </DialogActions>
        <ConfirmDialog {...localState.dataDialog} />
        <VersionPreview
          {...localState.dataPreviewDialog}
          closeDialogVersion={onClose}
        />
      </Dialog>
    </>
  );
}
