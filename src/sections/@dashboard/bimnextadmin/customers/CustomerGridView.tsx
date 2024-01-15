import { useEffect, useRef } from 'react';
// @mui
import { Collapse, Box, Divider, Button, Stack } from '@mui/material';
// @types
import { IFile } from '../../../../@types/file';
// components
import {
  TableProps,
  TablePaginationCustom,
} from 'src/components/table';
import EmptyContent from 'src/components/empty-content/EmptyContent';
import Iconify from '../../../../components/iconify';
//
import CustomerCard from './CustomerCard';
// locales
import { useLocales } from 'src/locales';
// type
import { ICustomer, ICustomerResGetAll, ICustomerReqCreate } from 'src/shared/types/customer';
import { useAuthContext } from 'src/auth/useAuthContext';
import { DenseEnum } from 'src/shared/enums';
// ----------------------------------------------------------------------

type Props = {
  table: TableProps;
  data: ICustomer[];
  dataFiltered: ICustomer[];
  showUpdateCustomer: (id: string) => void;
  onDeleteCustomer: (id: string) => void;
  onBlockCustomer: (id: string) => void;
  openContracts: (id: string) => void;
  openApps: (id: string) => void;
  isNotFound: boolean;
};

export default function CustomerGridView({
  table,
  data,
  dataFiltered,
  showUpdateCustomer,
  onDeleteCustomer,
  onBlockCustomer,
  openContracts,
  openApps,
  isNotFound,
}: Props) {
  
  const containerRef = useRef(null);
  const { user } = useAuthContext();
  const { translate } = useLocales();
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
      <Box ref={containerRef}>
        
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
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((cus) => (
              <CustomerCard
                key={cus._id}
                customer={cus}
                onUpdateCustomer={() => showUpdateCustomer(cus._id)}
                onDeleteCustomer={() => onDeleteCustomer(cus._id)}
                onBlockCustomer={() => onBlockCustomer(cus._id)}
                openContracts={() => openContracts(cus._id)}
                openApps={() => openApps(cus._id)}
                sx={{ maxWidth: 'auto' }}
              />
            ))}
        </Box>

        {isNotFound ? 
          <Stack>
            <EmptyContent
              title={`${translate('common.no_data')}`}
              sx={{
                '& span.MuiBox-root': { height: 160 },
              }}
            />
          </Stack>
          :
          null
        }
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

      </Box>

    </>
  );
}
