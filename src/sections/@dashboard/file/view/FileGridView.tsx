import { useState, useRef } from 'react';
// @mui
import { Collapse, Box, Divider, Button } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import EmptyContent from 'src/components/empty-content/EmptyContent';
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
import FilePanel from '../FilePanel';
import FileActionSelected from '../portal/FileActionSelected';
import { IFileOrFolder, IFolder, IFileAndFolderSearching } from 'src/shared/types/folder';
import FileFolderComponent from '../item/FileFolderComponent';
import { useLocales } from 'src/locales';
// ----------------------------------------------------------------------

type ILocalState = {
  collapseFiles: boolean;
  collapseFolders: boolean;
};

type Props = {
  table: TableProps;
  tableData: IFileOrFolder[];
  dataFiltered: IFileOrFolder[];
  isNotFound: boolean;
  //
  onOpenRow: (id: string, type: string) => void;
  onRenameRow: (id: string) => void;
  onPermission: (id: string) => void;
  onDeleteRow: (id: string) => void;
  onFolderVersion: (id: string) => void;
  onMoveFolder: (id: string) => void;
  onPreviewFile: (id: string) => void;
  onMoveFile: (id: string) => void;
  onDeleteFile: (id: string) => void;
  //
  searchMode: boolean;
  searchRes: IFileAndFolderSearching | null;
  onLinkClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  folderNameStyle: object;
  //
  detailsId: string;
  onDetails: (itemId: string, type: string) => void;
  //
  onDownloadSelected: (selected: string[]) => void;
  onMoveItems: (selected: string[]) => void;
  onDeleteItemsDialog: (oepn: boolean) => void;
};

export default function FileGridView({
  table,
  tableData,
  dataFiltered,
  isNotFound,
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
  const { translate } = useLocales();
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
  const containerRef = useRef(null);

  const [localState, setLocalState] = useState<ILocalState>({
    collapseFiles: false,
    collapseFolders: false,
  });

  return (
    <>
      <Box ref={containerRef}>
        <FilePanel
          title={`${translate('cloud.folder')}`}
          subTitle={`${tableData.filter((item) => item.type === 'folder').length} folders`}
          collapse={localState.collapseFolders}
          onCollapse={() => setLocalState((prevState: ILocalState) => ({ ...prevState, collapseFolders: !localState.collapseFolders }))}
        />

        <Collapse in={!localState.collapseFolders} unmountOnExit>
          <Box
            gap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
          >
            {dataFiltered
              .filter((i) => i.type === 'folder')
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((folder) => (
                <FileFolderComponent
                  key={folder.data._id}
                  rowType={'grid'}
                  row={folder}
                  selected={selected.includes(folder.data._id)}
                  onSelectRow={() => onSelectRow(folder.data._id)}
                  //
                  onOpenRow={() => onOpenRow(folder.data._id, folder.type)}
                  onRenameRow={() => onRenameRow(folder.data._id)}
                  onPermission={() => onPermission(folder.data._id)}
                  onDeleteRow={() => onDeleteRow(folder.data._id)}
                  onFolderVersion={() => onFolderVersion(folder.data._id)}
                  onMoveFolder={() => onMoveFolder(folder.data._id)}
                  onPreviewFile={() => onPreviewFile(folder.data._id)}
                  onMoveFile={() => onMoveFile(folder.data._id)}
                  onDeleteFile={() => onDeleteFile(folder.data._id)}
                  //
                  searchMode={searchMode}
                  searchRes={searchRes}
                  onLinkClick={onLinkClick}
                  folderNameStyle={folderNameStyle}
                  //
                  detailsId={detailsId}
                  onDetails={() => onDetails(folder.data._id, folder.type)}
                />
              ))}
          </Box>
          {isNotFound ? (
            <EmptyContent
              title={`${translate('common.no_data')}`}
              sx={{
                '& span.MuiBox-root': { height: 160 },
              }}
            />
          ) : (
            <></>
          )}
        </Collapse>

        <Divider sx={{ my: 5, borderStyle: 'dashed' }} />

        <FilePanel
          title={`${translate('cloud.file')}`}
          subTitle={`${tableData.filter((item) => item.type !== 'folder').length} files`}
          collapse={localState.collapseFiles}
          onCollapse={() => setLocalState((prevState: ILocalState) => ({ ...prevState, collapseFiles: !localState.collapseFiles }))}
        />

        <Collapse in={!localState.collapseFiles} unmountOnExit>
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
            gap={3}
          >
            {dataFiltered
              .filter((i) => i.type !== 'folder')
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((file) => (
                <FileFolderComponent
                  key={file.data._id}
                  rowType={'grid'}
                  row={file}
                  selected={selected.includes(file.data._id)}
                  onSelectRow={() => onSelectRow(file.data._id)}
                  //
                  onOpenRow={() => onOpenRow(file.data._id, file.type)}
                  onRenameRow={() => onRenameRow(file.data._id)}
                  onPermission={() => onPermission(file.data._id)}
                  onDeleteRow={() => onDeleteRow(file.data._id)}
                  onFolderVersion={() => onFolderVersion(file.data._id)}
                  onMoveFolder={() => onMoveFolder(file.data._id)}
                  onPreviewFile={() => onPreviewFile(file.data._id)}
                  onMoveFile={() => onMoveFile(file.data._id)}
                  onDeleteFile={() => onDeleteFile(file.data._id)}
                  //
                  searchMode={searchMode}
                  searchRes={searchRes}
                  onLinkClick={onLinkClick}
                  folderNameStyle={folderNameStyle}
                  //
                  detailsId={detailsId}
                  onDetails={() => onDetails(file.data._id, file.type)}
                />
              ))}
          </Box>
          {isNotFound ? (
            <EmptyContent
              title={`${translate('common.no_data')}`}
              sx={{
                '& span.MuiBox-root': { height: 160 },
              }}
            />
          ) : (
            <></>
          )}
        </Collapse>

        {!!selected?.length && (
          <FileActionSelected
            numSelected={selected.length}
            rowCount={dataFiltered.length}
            selected={selected}
            onSelectAllItems={(checked) =>
              onSelectAllRows(
                checked,
                dataFiltered.map((row) => row.data._id)
              )
            }
            action={
              <>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  startIcon={<Iconify icon="material-symbols:move-group" />}
                  onClick={() => onMoveItems(selected)}
                  sx={{ mr: 1 }}
                >
                  {`${translate('cloud.move')}`}
                </Button>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  startIcon={<Iconify icon="octicon:download-16" />}
                  onClick={() => onDownloadSelected(selected)}
                  sx={{ mr: 1 }}
                >
                  {`${translate('cloud.download')}`}
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  startIcon={<Iconify icon="material-symbols:delete-outline" />}
                  onClick={() => onDeleteItemsDialog(true)}
                  sx={{ mr: 1 }}
                >
                  {`${translate('cloud.delete')}`}
                </Button>
              </>
            }
          />
        )}
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
