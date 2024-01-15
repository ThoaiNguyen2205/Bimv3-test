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
} from 'src/components/table';
// sections
import { CustomerTableRow } from 'src/sections/@dashboard/bimnextadmin/customers';
// locales
import { useLocales } from 'src/locales';
// Auth
import { useAuthContext } from 'src/auth/useAuthContext';
// type
import { ICustomer } from 'src/shared/types/customer';
import { useEffect } from 'react';
// enums
import { DenseEnum } from 'src/shared/enums';
// ----------------------------------------------------------------------

type Props = {
  table: TableProps;
  tableData: ICustomer[];
  isNotFound: boolean;
  dataFiltered: ICustomer[];
  showUpdateCustomer: (id: string) => void;
  onDeleteCustomer: (id: string) => void;
  onBlockCustomer: (id: string) => void;
  openContracts: (id: string) => void;
  openApps: (id: string) => void;
};

export default function CustomerListView({
  table,
  tableData,
  isNotFound,
  dataFiltered,
  showUpdateCustomer,
  onDeleteCustomer,
  onBlockCustomer,
  openContracts,
  openApps,
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  
  const TABLE_HEAD = [
    { id: 'logo', label: `${translate('common.logo')}`, align: 'left', width: 120 },
    { id: 'customer', label: `${translate('common.customer')}`, align: 'left', width: 360 },
    { id: 'shortname', label: `${translate('common.shortname')}`, align: 'left', width: 120 },
    { id: 'contact', label: `${translate('common.contact')}`, align: 'left', width: 120 },
    { id: 'email', label: `email`, align: 'left', width: 120 },
    { id: 'phone', label: `${translate('common.phone')}`, align: 'left', width: 120 },
    { id: 'taxcode', label: `${translate('common.taxcode')}`, align: 'left', width: 120 },
    { id: 'createdby', label: `${translate('common.createdby')}`, align: 'left', width: 120 },
    { id: 'block', label: `${translate('common.block')}`, align: 'center', width: 100 },
    { id: '' },
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
                  <CustomerTableRow
                    key={row._id}
                    row={row}
                    showUpdateCustomer={() => showUpdateCustomer(row._id)}
                    onDeleteCustomer={() => onDeleteCustomer(row._id)}
                    onBlockCustomer={() => onBlockCustomer(row._id)}
                    openContracts={() => openContracts(row._id)}
                    openApps={() => openApps(row._id)}
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
