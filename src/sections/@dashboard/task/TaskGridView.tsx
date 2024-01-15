import { useState, useRef } from 'react';
// @mui
import { Collapse, Box, Divider, Button, Stack } from '@mui/material';
// components
import Iconify from '../../../components/iconify';
import EmptyContent from 'src/components/empty-content/EmptyContent';
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
import { useLocales } from 'src/locales';
import { IMainTask } from 'src/shared/types/mainTask';
import { TaskCategory } from 'src/shared/enums';
// ----------------------------------------------------------------------

type Props = {
  category: TaskCategory;
  table: TableProps;
  tableData: IMainTask[];
  dataFiltered: IMainTask[];
  isNotFound: boolean;
  //
  onOpenRow: (id: string) => void;
  onEditRow: (id: string) => void;
  onPermission: (id: string) => void;
  onDeleteRow: (id: string) => void;
  //
  detailsId: string;
  onDetails: (itemId: string) => void;
};

export default function TaskGridView({
  category,
  table,
  tableData,
  dataFiltered,
  isNotFound,
  //
  onOpenRow,
  onEditRow,
  onPermission,
  onDeleteRow,
  //
  detailsId,
  onDetails,
}: Props) {
  const { translate } = useLocales();
  const {
    dense,
    page,
    rowsPerPage,
    selected,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = table;
  const containerRef = useRef(null);

  return (
    <>
      <Box ref={containerRef}>
        <Stack sx={{ p: 2 }}>
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
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TaskComponent
                  category={category}
                  key={row._id}
                  rowType={'grid'}
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
        </Stack>
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
