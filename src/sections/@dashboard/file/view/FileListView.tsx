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
import FileFolderComponent from '../item/FileFolderComponent';
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
  isNotFound: boolean;
  dataFiltered: IFileOrFolder[];
  //
  onOpenRow: (id: string, type: string) => void;
  onRenameRow: (id: string) => void;
  onPermission: (id: string) => void;
  onDeleteRow: (id: string) => void;
  onFolderVersion: (id: string) => void;
  onMoveFolder: (id: string) => void;
  onPreviewFile: (id: string) => void;
  onMoveFile: (id: string) => void,
  onDeleteFile: (id: string) => void;
  //
  searchMode: boolean;
  searchRes: IFileAndFolderSearching | null;
  onLinkClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  folderNameStyle: object,
  //
  detailsId: string;
  onDetails: (itemId: string, type: string) => void;
  //
  onDownloadSelected: (selected: string[]) => void;
  onMoveItems: (selected: string[]) => void;
  onDeleteItemsDialog: (oepn: boolean) => void;
};

export default function FileListView({
  table,
  tableData,
  isNotFound,
  dataFiltered,
  //
  onOpenRow,
  onRenameRow,
  onPermission,
  onDeleteRow,
  onFolderVersion,
  onMoveFolder,
  onPreviewFile,
  onMoveFile,
  onDeleteFile,
  //
  searchMode,
  searchRes,
  onLinkClick,
  folderNameStyle,
  //
  detailsId,
  onDetails,
  //
  onDownloadSelected,
  onMoveItems,
  onDeleteItemsDialog,
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const TABLE_HEAD = [
    { id: 'name', label: `${translate('cloud.name')}`, align: 'left', width: 200 },
    { id: 'size', label: `(Mb)`, align: 'left', width: 80 },
    { id: 'type', label: ``, align: 'left', width: 80 },
    { id: 'version', label: `${translate('cloud.version')}`, align: 'center', width: 120 },
    { id: 'dateModified', label: `${translate('cloud.update')}`, align: 'left' },
    { id: 'group', label: `${translate('nav.groups')}`, align: 'left', width: 100 },
    { id: '' },
  ];
  const TABLE_HEAD_SEARCHMODE = [
    { id: 'name', label: `${translate('cloud.name')}`, align: 'left', width: 200 },
    { id: 'size', label: `(Mb)`, align: 'left', width: 80 },
    { id: 'type', label: ``, align: 'left', width: 80 },
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
              // dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => row.data._id)
            )
          }
          action={
            <>
              <Tooltip title={`${translate('cloud.move')}`} placement='top'>
                <IconButton color="primary" onClick={() => onMoveItems(selected)}>
                  <Iconify icon="material-symbols:move-group" />
                </IconButton>
              </Tooltip>
              <Tooltip title={`${translate('cloud.download')}`} placement='top'>
                <IconButton color="primary" onClick={() => onDownloadSelected(selected)}>
                  <Iconify icon="octicon:download-16" />
                </IconButton>
              </Tooltip>
              <Tooltip title={`${translate('cloud.delete')}`} placement='top'>
                <IconButton color="error" onClick={() => onDeleteItemsDialog(true)}>
                  <Iconify icon="material-symbols:delete-outline" />
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
              headLabel={searchMode ? TABLE_HEAD_SEARCHMODE : TABLE_HEAD}
              rowCount={tableData.length}
              numSelected={selected.length}
              onSort={onSort}
              onSelectAllRows={(checked) =>
                onSelectAllRows(
                  checked,
                  tableData.map((row) => row.data._id)
                  // dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => row.data._id)
                )
              }
              sx={{
                '& .MuiTableCell-head': {
                  bgcolor: 'transparent',
                },
              }}
            />

            <TableBody>
              {dataFiltered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <FileFolderComponent
                    key={row.data?._id}
                    rowType={'table'}
                    row={row}
                    selected={selected.includes(row.data?._id)}
                    onSelectRow={() => onSelectRow(row.data?._id)}
                    //
                    onOpenRow={() => onOpenRow(row.data?._id, row.type)}
                    onRenameRow={() => onRenameRow(row.data?._id)}
                    onPermission={() => onPermission(row.data?._id)}
                    onDeleteRow={() => onDeleteRow(row.data?._id)}
                    onFolderVersion={() => onFolderVersion(row.data?._id)}
                    onMoveFolder={() => onMoveFolder(row.data?._id)}
                    onPreviewFile={() => onPreviewFile(row.data?._id)}
                    onMoveFile={() => onMoveFile(row.data?._id)}
                    onDeleteFile={() => onDeleteFile(row.data?._id)}
                    //
                    searchMode={searchMode}
                    searchRes={searchRes}
                    onLinkClick={onLinkClick}
                    folderNameStyle={folderNameStyle}
                    //
                    detailsId={detailsId}
                    onDetails={() => onDetails(row.data._id, row.type)}
                  />
                ))}

              <TableEmptyRows
                height={denseHeight}
                emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
              />

              <TableNoData isNotFound={isNotFound} />
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <TablePaginationCustom
        count={dataFiltered.length}
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
