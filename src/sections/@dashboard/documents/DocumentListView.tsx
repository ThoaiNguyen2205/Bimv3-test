import { useEffect } from 'react';
// @mui
import { Table, TableBody, TableContainer, Box } from '@mui/material';
// components
import {
  emptyRows,
  TableProps,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
  useTable
} from '../../../components/table';
//hook
import useResponsive from '../../../hooks/useResponsive';
//context
import { useAuthContext } from '../../../auth/useAuthContext';
// sections
import DocumentTableRow from './DocumentTableRow';
// locales
import { useLocales } from '../../../locales';
// type
import { IBimDocument } from '../../../shared/types/bimDocument';
// enums
import { DenseEnum } from '../../../shared/enums';

// ----------------------------------------------------------------------
type Props = {
  table: TableProps;
  tableData: IBimDocument[];
  isNotFound: boolean;
  dataFiltered: IBimDocument[];
  showEditDocument: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  jumpToEditor: (id: string) => void;
  onShareDocument: (id: string) => void;
  onSetPermit: (id: string) => void;
  viewCover: (coverString: string | null) => void;
  resetFormEditor: () => void;
};

export default function DocumentListView({
  table,
  tableData,
  isNotFound,
  dataFiltered,
  showEditDocument,
  onDeleteDocument,
  jumpToEditor,
  onShareDocument,
  onSetPermit,
  viewCover,
  resetFormEditor
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const isDesktopMd = useResponsive('up', 'md');

  const TABLE_HEAD = isDesktopMd
    ? [
        {
          id: 'cover',
          label: `${translate('documents.cover')}`,
          align: 'center',
          width: '10%'
        },
        {
          id: 'title',
          label: `${translate('documents.title')}`,
          align: 'center',
          width: '30%'
        },
        {
          id: 'category',
          label: `${translate('documents.category')}`,
          align: 'center',
          width: '10%'
        },
        {
          id: 'settings',
          label: `${translate('documents.settings')}`,
          align: 'center',
          width: '15%'
        },
        {
          id: 'createat',
          label: `${translate('common.created_at')}`,
          align: 'center',
          width: '11%'
        },
        {
          id: 'view',
          label: `${translate('documents.view')}`,
          align: 'center',
          width: '7%'
        },
        {
          id: 'comments',
          label: `${translate('documents.comments')}`,
          align: 'center',
          width: '7%'
        },
        {
          id: 'share',
          label: `${translate('documents.share')}`,
          align: 'center',
          width: '10%'
        }
      ]
    : [
        {
          id: 'cover',
          label: `${translate('documents.cover')}`,
          align: 'center',
          width: '15%'
        },
        {
          id: 'title',
          label: `${translate('documents.title')}`,
          align: 'center',
          width: '35%'
        },
        {
          id: 'category',
          label: `${translate('documents.category')}`,
          align: 'center',
          width: '15%'
        },
        {
          id: 'settings',
          label: `${translate('documents.settings')}`,
          align: 'center',
          width: '20%'
        },
        {
          id: 'createat',
          label: `${translate('common.created_at')}`,
          align: 'center',
          width: '15%'
        },
        { id: '' }
      ];

  const {
    dense,
    page,
    order,
    orderBy,
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
      <Box className="box-table">
        <TableContainer className="box-table__container">
          <Table className="table" size={dense ? 'small' : 'medium'}>
            <TableHeadCustom
              order={order}
              orderBy={orderBy}
              headLabel={TABLE_HEAD}
              rowCount={tableData.length}
              onSort={onSort}
              sx={{
                '& .MuiTableCell-head': {
                  bgcolor: 'transparent'
                }
              }}
            />
            <TableBody className="table__body">
              {dataFiltered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <DocumentTableRow
                    resetFormEditor={resetFormEditor}
                    key={row._id}
                    row={row}
                    showEditDocument={() => showEditDocument(row._id)}
                    onDeleteDocument={() => onDeleteDocument(row._id)}
                    jumpToEditor={() => jumpToEditor(row._id)}
                    onShareDocument={() => onShareDocument(row._id)}
                    onSetPermit={() => onSetPermit(row._id)}
                    viewCover={() => viewCover(row.cover)}
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
        dense={dense}
        onChangeDense={onChangeDense}
        sx={{
          '& .MuiTablePagination-root': { borderTop: 'none' },
          '& .MuiFormControlLabel-root': { px: 0 }
        }}
      />
    </>
  );
}
