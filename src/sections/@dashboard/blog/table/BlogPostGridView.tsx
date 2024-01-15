import { useEffect } from 'react';
// @mui
import { Box, Stack } from '@mui/material';
// @types

//enums
import { DenseEnum } from '../../../../shared/enums';
// locales
import { useLocales } from '../../../../locales';
// type
import { useAuthContext } from '../../../../auth/useAuthContext';
import { IBlog } from '../../../../shared/types/blog';
import { TableProps } from '../../../../components/table';
//components
import EmptyContent from '../../../../components/empty-content/EmptyContent';
//sections
import BlogPostCard from '../card/BlogPostCard';
import BlogTablePaginationGrid from './BlogTablePaginationGrid';

// ----------------------------------------------------------------------
type Props = {
  isDashboard: boolean;
  table: TableProps;
  tableData: IBlog[];
};

export default function BlogPostGridView({ isDashboard, table, tableData }: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const isNotFound = !tableData.length;
  const {
    dense,
    page,
    rowsPerPage,
    //
    setDense,
    onChangePage,
    onChangeRowsPerPage
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
    <Box className="blog-posts__grid-container">
      <Box
        className={` blog-posts__list ${
          page === 0 && 'blog-posts__list-latest'
        }`}>
        {tableData
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((post, index) => (
            <Box
              key={post._id}
              className={`blog-posts__list-item ${
                page === 0 && 'list__item-latest'
              }`}>
              <BlogPostCard isDashboard={isDashboard} post={post} index={index} page={page} />
            </Box>
          ))}
      </Box>
      {isNotFound ? (
        <Stack>
          <EmptyContent
            title={`${translate('common.no_data')}`}
            sx={{
              '& span.MuiBox-root': { height: 160 }
            }}
          />
        </Stack>
      ) : null}
      <BlogTablePaginationGrid
        className=" blog-posts__pagination"
        count={tableData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        dense={dense}
      />
    </Box>
  );
}
