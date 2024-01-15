// @mui
import { Table, TableBody, TableContainer, Box } from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import {
  emptyRows,
  TableProps,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
//
import UserTableRow from './UserTableRow';
// locales
import { useLocales } from 'src/locales';
// type
import { IUser } from 'src/shared/types/user';
// ----------------------------------------------------------------------

type Props = {
  table: TableProps;
  tableData: IUser[];
  isNotFound: boolean;
  dataFiltered: IUser[];
  openClass: (id: string) => void;
  onBlockUser: (id: string) => void;
  onDeleteRow: (id: string) => void;
};

export default function UserListView({
  table,
  tableData,
  isNotFound,
  openClass,
  onBlockUser,
  onDeleteRow,
  dataFiltered,
}: Props) {
  const { translate } = useLocales();
  
  const TABLE_HEAD = [
    { id: 'avatar', label: `${translate('common.avatar')}`, align: 'left', width: 120 },
    { id: 'username', label: `${translate('common.username')}`, align: 'left', width: 200 },
    { id: 'email', label: `email`, align: 'left', width: 360 },
    { id: 'role', label: `${translate('common.role')}`, align: 'left', width: 120 },
    { id: 'status', label: `${translate('common.status')}`, align: 'center', width: 120 },
    { id: 'active', label: `${translate('common.active')}`, align: 'center', width: 120 },
    { id: 'block', label: `${translate('common.block')}`, align: 'center', width: 120 },
    { id: '' },
  ];

  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = table;

  const denseHeight = dense ? 52 : 72;
  
  return (
    <>
      <Box sx={{ px: 1, position: 'relative', borderRadius: 1.5, bgcolor: 'background.neutral' }}>
        
        <TableContainer>
          <Table
            size={dense ? 'small' : 'medium'}
            sx={{
              minWidth: 960,
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
                  <UserTableRow
                    key={row.id}
                    row={row}
                    openClass={() => openClass(row.id)}
                    onBlockUser={() => onBlockUser(row.id)}
                    onDeleteRow={() => onDeleteRow(row.id)}
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
          '& .MuiFormControlLabel-root': { px: 0 },
        }}
      />
    </>
  );
}
