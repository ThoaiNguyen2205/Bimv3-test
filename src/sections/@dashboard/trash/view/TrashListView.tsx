// react
import { useEffect } from 'react';
// @mui
import { Table, Tooltip, TableBody, IconButton, TableContainer, Box } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import {
  emptyRows,
  TableProps,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../../../components/table';
//
import TrashComponent from '../item/TrashComponent';
// type
import { IFileOrFolder, IFolder, IFileAndFolderSearching } from 'src/shared/types/folder';
import { useLocales } from 'src/locales';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// enums
import { DenseEnum } from 'src/shared/enums';
import filesApi from 'src/api/filesApi';
import { IFileZipReq } from 'src/shared/types/file';
// ----------------------------------------------------------------------

type Props = {
  table: TableProps;
  tableData: IFileOrFolder[];
  // isNotFound: boolean;
  // dataFiltered: IFileOrFolder[];
  pageCount: number;
  //
  onDeleteRow: (id: string, type: string) => void;
  onRestoreRow: (id: string, type: string) => void;
  onHandleDeleleTrashes: (open: boolean, selected: string[]) => void;
  onHandleRestoreTrashes: (open: boolean, selected: string[]) => void;
  detailsId: string;
  onDetails: (itemId: string, type: string) => void;
};

export default function TrashListView({
  table,
  tableData,
  pageCount,
  //
  onDeleteRow,
  onRestoreRow,
  onHandleDeleleTrashes,
  onHandleRestoreTrashes,
  detailsId,
  onDetails,
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const TABLE_HEAD = [
    { id: 'name', label: `${translate('cloud.name')}`, align: 'left', width: 260 },
    { id: 'size', label: `(Mb)`, align: 'left', width: 80 },
    // { id: 'type', label: ``, align: 'left', width: 80 },
    { id: 'version', label: `${translate('cloud.version')}`, align: 'center', width: 120 },
    { id: 'dateModified', label: `${translate('cloud.update')}`, align: 'left' },
    { id: 'dateTrashed', label: `${translate('cloud.trash')}`, align: 'left' },
    { id: 'group', label: `${translate('nav.groups')}`, align: 'left', width: 100 },
    { id: '' },
  ];
  const TABLE_HEAD_SEARCHMODE = [
    { id: 'name', label: `${translate('cloud.name')}`, align: 'left', width: 260 },
    { id: 'size', label: `(Mb)`, align: 'left', width: 80 },
    // { id: 'type', label: ``, align: 'left', width: 80 },
    { id: 'version', label: `${translate('cloud.version')}`, align: 'center', width: 120 },
    { id: 'dateModified', label: `${translate('cloud.update')}`, align: 'left' },
    { id: 'group', label: `${translate('nav.groups')}`, align: 'left', width: 100 },
    { id: 'location', label: `${translate('cloud.location')}`, align: 'right' },
    { id: '' },
  ];

  const {
    dense,
    setDense,
    page,
    order,
    orderBy,
    rowsPerPage,
    //
    selected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = table;

  const denseHeight = dense ? 52 : 72;

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
      <Box sx={{ px: 1, position: 'relative', borderRadius: 1.5, bgcolor: 'background.neutral' }}>
        <TableSelectedAction
          dense={dense}
          numSelected={selected.length}
          rowCount={tableData.length}
          onSelectAllRows={(checked) =>
            onSelectAllRows(
              checked,
              tableData.map((row) => row.data._id)
            )
          }
          action={
            <>
              <Tooltip title={`${translate('cloud.restore')}`}>
                <IconButton
                  color="primary"
                  onClick={() => onHandleRestoreTrashes(true, selected)}
                >
                  <Iconify icon="ic:round-restore" />
                </IconButton>
              </Tooltip>
              <Tooltip title={`${translate('cloud.download_files')}`}>
                <IconButton
                  color="error"
                  onClick={() => onHandleDeleleTrashes(true, selected)}
                >
                  <Iconify icon="tabler:trash-off" />
                </IconButton>
              </Tooltip>
            </>
          }
          sx={{
            pl: 1,
            pr: 2,
            top: 8,
            left: 8,
            right: 8,
            width: 'auto',
            borderRadius: 1,
          }}
        />

        <TableContainer>
          <Table
            size={dense ? 'small' : 'medium'}
            sx={{
              // minWidth: 960,
              borderCollapse: 'separate',
              borderSpacing: '0 8px',
              '& .MuiTableCell-head': {
                boxShadow: 'none !important',
              },
            }}
          >
            <TableHeadCustom
              order={order}
              orderBy={orderBy}
              headLabel={TABLE_HEAD}
              rowCount={tableData.length}
              numSelected={selected.length}
              onSort={onSort}
              onSelectAllRows={(checked) =>
                onSelectAllRows(
                  checked,
                  tableData.map((row) => row.data._id)
                )
              }
              sx={{
                '& .MuiTableCell-head': {
                  bgcolor: 'transparent',
                },
              }}
            />

            <TableBody>
              {tableData && tableData.map((row) => (
                <TrashComponent
                  key={row.data?._id}
                  row={row}
                  selected={selected.includes(row.data?._id)}
                  onSelectRow={() => onSelectRow(row.data?._id)}
                  //
                  onDeleteRow={() => onDeleteRow(row.data?._id, row.type)}
                  onRestoreRow={() => onRestoreRow(row.data?._id, row.type)}
                  //
                  detailsId={detailsId}
                  onDetails={() => onDetails(row.data?._id, row.type)}
                />
              ))}

              {/* <TableEmptyRows
                height={denseHeight}
                emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
              /> */}

              <TableNoData isNotFound={(tableData.length < 1)} />
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <TablePaginationCustom
        count={pageCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        //
        dense={dense}
        onChangeDense={onChangeDense}
        sx={{
          '& .MuiTablePagination-root': { borderTop: 'none' },
          '& .MuiFormControlLabel-root': { px: 0 },
        }}
      />
    </>
  );
}
