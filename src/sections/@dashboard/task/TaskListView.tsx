// react
import { useEffect } from 'react';
// @mui
import { Table, Tooltip, TableBody, IconButton, TableContainer, Box } from '@mui/material';
// components
import Iconify from '../../../components/iconify';
import {
  emptyRows,
  TableProps,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../../components/table';
//
import TaskComponent from './TaskComponent';
// type
import { useLocales } from 'src/locales';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// enums
import { DenseEnum, TaskCategory } from 'src/shared/enums';
import { IMainTask } from 'src/shared/types/mainTask';
// ----------------------------------------------------------------------

type Props = {
  category: TaskCategory;
  table: TableProps;
  tableData: IMainTask[];
  isNotFound: boolean;
  dataFiltered: IMainTask[];
  //
  onOpenRow: (id: string) => void;
  onEditRow: (id: string) => void;
  onPermission: (id: string) => void;
  onDeleteRow: (id: string) => void;
  //
  detailsId: string;
  onDetails: (itemId: string) => void;
};

export default function TaskListView({
  category,
  table,
  tableData,
  isNotFound,
  dataFiltered,
  //
  onOpenRow,
  onEditRow,
  onPermission,
  onDeleteRow,
  //
  detailsId,
  onDetails,
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const TABLE_HEAD = [
    { id: 'name', label: `${translate('cloud.name')}`, align: 'left', width: 250 },
    { id: 'description', label: `${translate('common.description')}`, align: 'left', width: 300 },
    { id: 'permission', label: `${translate('common.permission')}`, align: 'left', width: 120 },
    { id: 'created', label: `${translate('task.created')}`, align: 'left' },
    { id: 'updated', label: `${translate('common.created_at')}`, align: 'left' },
    { id: 'group', label: `${translate('nav.groups')}`, align: 'left', width: 100 },
    { id: '' },
  ];
  const COLLABORATION_TABLE_HEAD = [
    { id: 'name', label: `${translate('cloud.name')}`, align: 'left', width: 250 },
    { id: 'description', label: `${translate('common.description')}`, align: 'left', width: 300 },
    { id: 'type', label: `${translate('task.category')}`, align: 'left', width: 80 },
    { id: 'permission', label: `${translate('common.permission')}`, align: 'left', width: 120 },
    { id: 'created', label: `${translate('task.created')}`, align: 'left' },
    { id: 'updated', label: `${translate('common.created_at')}`, align: 'left' },
    { id: 'group', label: `${translate('nav.groups')}`, align: 'left', width: 100 },
    { id: '' },
  ];

  const {
    dense,
    setDense,
    page,
    order,
    orderBy,
    rowsPerPage,
    selected,
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

        <TableContainer>
          <Table
            size={dense ? 'small' : 'medium'}
            sx={{
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
              headLabel={category.includes('Collaboration') ? COLLABORATION_TABLE_HEAD : TABLE_HEAD}
              numSelected={selected.length}
              onSort={onSort}
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
                  <TaskComponent
                    category={category}
                    key={row._id}
                    rowType={'table'}
                    row={row}
                    selected={selected.includes(row._id)}
                    //
                    onOpenRow={() => onOpenRow(row._id)}
                    onEditRow={() => onEditRow(row._id)}
                    onPermission={() => onPermission(row._id)}
                    onDeleteRow={() => onDeleteRow(row._id)}
                    //
                    detailsId={detailsId}
                    onDetails={() => onDetails(row._id)}
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
