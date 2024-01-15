import { useState, useEffect } from 'react';
// @mui
import {
  Card,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  InputAdornment,
  Stack,
  TableContainer,
  Table,
  TableBody,
  Typography,
  TextField
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import {
  useTable,
  TableNoData,
  getComparator
} from '../../../../components/table';
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar/Scrollbar';
// Locales
import { useLocales } from '../../../../locales';
// zustand store
import useBimDocument from '../../../../redux/bimDocumentStore';
import { shallow } from 'zustand/shallow';
// enums
import { PermissionType } from '../../../../shared/enums';
// sections
// type
import {
  IUserInDocument,
  IUserInDocumentReqCreate
} from '../../../../shared/types/usersInDocument';
import { IUser } from '../../../../shared/types/user';
// utils

import _ from 'lodash';
// apis
import usersInDocumentsApi from '../../../../api/usersInDocumentsApi';

// ------------------------------------------------

type ILocalState = {
  users: IUserInDocument[];
  filterName: string;
  editChecked: IUserInDocument[];
  commentChecked: IUserInDocument[];
  isSaving: boolean;
};

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
}

export default function PermitDialog({ open, onClose, ...other }: Props) {
  const { translate } = useLocales();
  const { selectedDocument } = useBimDocument(
    (state) => ({
      selectedDocument: state.selectedData
    }),
    shallow
  );

  const { order, orderBy, setSelected } = useTable();

  const [localState, setLocalState] = useState<ILocalState>({
    users: [],
    filterName: '',
    editChecked: [],
    commentChecked: [],
    isSaving: false
  });

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

  const isFiltered = localState.filterName !== '';

  const applyFilter = ({
    inputData,
    comparator,
    filterName
  }: {
    inputData: IUserInDocument[];
    comparator: (a: any, b: any) => number;
    filterName: string;
  }) => {
    const stabilizedThis = inputData.map((el, index) => [el, index] as const);

    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });

    inputData = stabilizedThis.map((el) => el[0]);

    if (filterName) {
      const byName = inputData.filter(
        (useri) =>
          (useri.user as IUser).username
            .toLowerCase()
            .indexOf(filterName.toLowerCase()) !== -1
      );
      const byTitle = inputData.filter(
        (useri) =>
          (useri.user as IUser).email
            .toLowerCase()
            .indexOf(filterName.toLowerCase()) !== -1
      );

      inputData = _.union(byName, byTitle);
    }

    return inputData;
  };

  const dataFiltered = applyFilter({
    inputData: localState.users,
    comparator: getComparator(order, orderBy),
    filterName: localState.filterName
  });

  const handleFilter = (event: React.ChangeEvent<HTMLInputElement> | null) => {
    if (event !== null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        filterName: event.target.value
      }));
    }
  };

  useEffect(() => {
    setSelected([]);
  }, [localState.users]);

  // Permissions check
  const handleTogglePermissions = (rowId: string, permit: PermissionType) => {
    const item = localState.users.filter((i) => i._id === rowId)[0];

    const setEdit = (item: IUserInDocument) => {
      const currentIndex = localState.editChecked.indexOf(item);
      const newChecked = [...localState.editChecked];
      if (currentIndex === -1) {
        newChecked.push(item);
      } else {
        newChecked.splice(currentIndex, 1);
      }
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        editChecked: newChecked
      }));
    };

    const setComment = (item: IUserInDocument) => {
      const currentIndex = localState.commentChecked.indexOf(item);
      const newChecked = [...localState.commentChecked];
      if (currentIndex === -1) {
        newChecked.push(item);
      } else {
        newChecked.splice(currentIndex, 1);
      }
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        commentChecked: newChecked
      }));
    };

    switch (permit) {
      case PermissionType.edit:
        setEdit(item);
        break;
      case PermissionType.comment:
        setComment(item);
        break;
    }
  };

  const handleSave = async () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSaving: true
    }));
    if (selectedDocument === null) return;
    // Xóa tất cả các nhóm trong dự án hiện tại
    await usersInDocumentsApi.deleteInDocument(selectedDocument._id);
    // Thêm lại dữ liệu nhóm trong dự án
    for (const sel of localState.users) {
      const newUserInProjectData: IUserInDocumentReqCreate = {
        document: selectedDocument._id,
        user: (sel.user as IUser)._id,
        isEdit:
          localState.editChecked.filter((i) => i._id === sel._id).length > 0
            ? true
            : false,
        isComment:
          localState.commentChecked.filter((i) => i._id === sel._id).length > 0
            ? true
            : false
      };
      // console.log(newUserInProjectData);

      await usersInDocumentsApi.postCreate(newUserInProjectData);
    }

    onClose();
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSaving: false
    }));
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <DialogTitle>
        {' '}
        {`${translate('nav.project')} ${selectedDocument?.title}`}{' '}
      </DialogTitle>

      <DialogContent>
        <Card sx={{ borderRadius: 1.5 }}>
          <CardHeader title={'Người dùng'} sx={{ p: 2 }} />

          <>
            <Stack
              component="span"
              direction="row"
              alignItems="center"
              justifyContent="flex-start"
              sx={{ textAlign: 'right', pb: 1 }}>
              <Stack
                spacing={2}
                alignItems="center"
                direction={{
                  xs: 'column',
                  sm: 'row'
                }}
                sx={{ px: 2.5, pb: 1, width: '100%' }}>
                <TextField
                  size="small"
                  fullWidth
                  value={localState.filterName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleFilter(e)
                  }
                  placeholder={`${translate('common.search')}`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify
                          icon="eva:search-fill"
                          sx={{ color: 'text.disabled' }}
                        />
                      </InputAdornment>
                    )
                  }}
                />

                {isFiltered && (
                  <Button
                    color="error"
                    sx={{ flexShrink: 0 }}
                    onClick={() =>
                      setLocalState((prevState: ILocalState) => ({
                        ...prevState,
                        filterName: ''
                      }))
                    }
                    startIcon={<Iconify icon="eva:trash-2-outline" />}>
                    {`${translate('common.clear')}`}
                  </Button>
                )}
              </Stack>
            </Stack>
            <Stack
              component="span"
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              sx={{ textAlign: 'right', pr: 1, pb: 1 }}>
              <Typography variant="caption">{`${translate(
                'common.edit'
              )}`}</Typography>
              <Typography variant="caption" sx={{ ml: 3 }}>{`${translate(
                'documents.can_comment'
              )}`}</Typography>
            </Stack>
          </>

          <Divider />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar sx={{ maxHeight: 5 * 72, minHeight: 5 * 72 }}>
              <Table size={'medium'} sx={{ minWidth: 300 }}>
                <TableBody>
                  <TableNoData isNotFound={dataFiltered.length < 1} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        </Card>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-end' }}>
        {onClose && (
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="mdi:exit-to-app" />}
            onClick={onClose}>
            {`${translate('common.close')}`}
          </Button>
        )}
        <LoadingButton
          variant="contained"
          loading={localState.isSaving}
          onClick={handleSave}
          startIcon={<Iconify icon="fluent:save-16-filled" />}>
          {`${translate('common.save_changes')}`}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
