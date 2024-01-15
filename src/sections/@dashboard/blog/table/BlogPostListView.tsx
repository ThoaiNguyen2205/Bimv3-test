import { useEffect } from 'react';
// @mui
import { Table, TableBody, TableContainer, Box } from '@mui/material';
// components
import {
  emptyRows,
  TableProps,
  TableNoData,
  TableEmptyRows,
  TablePaginationCustom
} from '../../../../components/table';
//type
import { IBlog } from '../../../../shared/types/blog';
// locales
import { useLocales } from '../../../../locales';
// Auth
import { useAuthContext } from '../../../../auth/useAuthContext';
import useResponsive from '../../../../hooks/useResponsive';
// enums
import { DenseEnum } from '../../../../shared/enums';
// sections
import BlogTableHead from './BlogTableHead';
import PostItemList from '../PostItemList';

// ----------------------------------------------------------------------

type Props = {
  table: TableProps;
  tableData: IBlog[];
  isNotFound: boolean;

  openShareForm: (blog: IBlog | null) => void;
  deletePostConfirm: (postId: string | null) => void;
  handleEditPost: (postId: string) => void;
  handlePreview: (postId: string) => void;
  openViewCover: (coverString: string | null) => void;
};

export default function BlogPostListView({
  table,
  tableData,
  isNotFound,
  openViewCover,
  openShareForm,
  deletePostConfirm,
  handleEditPost,
  handlePreview
}: Props) {
  const isDesktopMd = useResponsive('up', 'md');
  const isDesktopSM = useResponsive('down', 'sm');
  const { user } = useAuthContext();
  const { translate } = useLocales();

  const {
    dense,
    page,
    rowsPerPage,
    //
    setDense,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage
  } = table;
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
          width: '35%'
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
          width: '18%'
        },
        {
          id: 'createat',
          label: `${translate('common.created_at')}`,
          align: 'center',
          width: '13%'
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
          width: '50%'
        },
        {
          id: 'setting',
          label: `${translate('documents.settings')}`,
          align: 'center',
          width: '15%'
        },
        {
          id: 'createat',
          label: `${translate('common.created_at')}`,
          align: 'center',
          width: '20%'
        }
      ];
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
      <Box className="box__table">
        <TableContainer className="table__container">
          <Table className="table" size={dense ? 'small' : 'medium'}>
            <BlogTableHead
              headLabel={TABLE_HEAD}
              rowCount={tableData.length}
              sx={{
                '& .MuiTableCell-head': {
                  bgcolor: 'transparent'
                }
              }}
            />
            <TableBody className="table__body">
              {tableData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <PostItemList
                    key={row._id}
                    row={row}
                    openShareForm={() => openShareForm(row)}
                    deletePostConfirm={() => deletePostConfirm(row._id)}
                    handleEditPost={() => handleEditPost(row._id)}
                    handlePreview={() => handlePreview(row._id)}
                    openViewCover={() => openViewCover(row.cover)}
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
        count={tableData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        dense={dense}
        onChangeDense={!isDesktopSM && onChangeDense}
        sx={{
          '& .MuiTablePagination-root': { borderTop: 'none' },
          '& .MuiFormControlLabel-root': { px: 0 }
        }}
      />
    </>
  );
}
