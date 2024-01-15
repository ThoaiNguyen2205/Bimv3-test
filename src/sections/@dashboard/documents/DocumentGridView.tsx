import { useEffect, useRef } from 'react';
// @mui
import { Box, Stack } from '@mui/material';
//context
import { useAuthContext } from '../../../auth/useAuthContext';
// @types
import { IBimDocument } from '../../../shared/types/bimDocument';
// components
import { TableProps } from '../../../components/table';
import EmptyContent from '../../../components/empty-content/EmptyContent';
import DocumentCard from './DocumentCard';
import { BlogTablePaginationGrid } from '../blog';
// locales
import { useLocales } from '../../../locales';
//enums
import { DenseEnum } from '../../../shared/enums';
// -----------------------------------------------------------------

type Props = {
  table: TableProps;
  tableData: IBimDocument[];
  isNotFound: boolean;
};

export default function DocumentGridView({
  table,
  tableData,

  isNotFound
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
    <>
      <Box ref={containerRef} className="documents-grid">
        <Box className="documents-grid__list">
          {tableData
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((doc) => (
              <DocumentCard
                key={doc._id}
                document={doc}
                sx={{ maxWidth: 'auto' }}
              />
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
          className="documents-grid__pagination"
          count={tableData.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onChangePage}
          onRowsPerPageChange={onChangeRowsPerPage}
          dense={dense}
        />
      </Box>
    </>
  );
}
