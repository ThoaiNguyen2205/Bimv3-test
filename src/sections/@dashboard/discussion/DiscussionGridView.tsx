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
import DiscussionComponent from './DiscussionComponent';
import { useLocales } from 'src/locales';
import { IMainTask, IDiscussionTask } from 'src/shared/types/mainTask';
import { TaskCategory } from 'src/shared/enums';
// ----------------------------------------------------------------------

type Props = {
  table: TableProps;
  tableData: IDiscussionTask[];
  dataFiltered: IDiscussionTask[];
  isNotFound: boolean;
  //
  onEditRow: (id: string) => void;
  onPermission: (id: string) => void;
  onDeleteRow: (id: string) => void;
  //
  replyId: string;
  onReply: (itemId: string) => void;
  //
  handleOpenFilesDialog: (tid: string, open: boolean) => void;
  handleOpenInfoDialog: (tid: string, open: boolean) => void;
};

export default function DiscussionGridView({
  table,
  tableData,
  dataFiltered,
  isNotFound,
  //
  onEditRow,
  onPermission,
  onDeleteRow,
  //
  replyId,
  onReply,
  //
  handleOpenFilesDialog,
  handleOpenInfoDialog,
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
              sm: 'repeat(1, 1fr)',
              md: 'repeat(1, 1fr)',
              lg: 'repeat(1, 1fr)',
            }}
          >
            {dataFiltered
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <DiscussionComponent
                  key={row.mainTask._id}
                  rowType={'grid'}
                  row={row}
                  selected={selected.includes(row.mainTask._id)}
                  //
                  onEditRow={() => onEditRow(row.mainTask._id)}
                  onPermission={() => onPermission(row.mainTask._id)}
                  onDeleteRow={() => onDeleteRow(row.mainTask._id)}
                  //
                  replyId={replyId}
                  onReply={() => onReply(row.mainTask._id)}
                  handleOpenFilesDialog={() => handleOpenFilesDialog(row.mainTask._id, true)}
                  handleOpenInfoDialog={() => handleOpenInfoDialog(row.mainTask._id, true)}
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
