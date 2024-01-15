import { useEffect, useRef } from 'react';
// @mui
import { Box, Stack } from '@mui/material';
// components
import {
  TableProps,
  TablePaginationCustom,
} from 'src/components/table';
import EmptyContent from 'src/components/empty-content/EmptyContent';
//
import UserCard from './UserCard';
// locales
import { useLocales } from 'src/locales';
// type
import { IUser } from 'src/shared/types/user';
import { useAuthContext } from 'src/auth/useAuthContext';
import { DenseEnum } from 'src/shared/enums';
// ----------------------------------------------------------------------

type Props = {
  table: TableProps;
  data: IUser[];
  dataFiltered: IUser[];
  openClass: (id: string) => void;
  onBlockUser: (id: string) => void;
  onDeleteItem: (id: string) => void;
  isNotFound: boolean;
};

export default function UserGridView({
  table,
  data,
  dataFiltered,
  openClass,
  onDeleteItem,
  onBlockUser,
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
            .map((user) => (
              <UserCard
                key={user.id}
                user={user}
                openClass={() => openClass(user.id)}
                onBlockUser={() => onBlockUser(user.id)}
                onDeleteItem={() => onDeleteItem(user.id)}
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
