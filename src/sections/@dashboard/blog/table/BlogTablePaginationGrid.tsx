// @mui
import { Theme } from '@mui/material/styles';
import {
  Box,
  Switch,
  SxProps,
  TablePagination,
  FormControlLabel,
  TablePaginationProps
} from '@mui/material';
//
import { useLocales } from '../../../../locales';
import useGlobalPostsPerPage from '../../../../redux/useGlobalPostsPerPage';
// ----------------------------------------------------------------------

type Props = {
  dense?: boolean;
  onChangeDense?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: SxProps<Theme>;
};

export default function BlogTablePaginationGrid({
  dense,
  onChangeDense,
  sx,
  ...other
}: Props & TablePaginationProps) {
  const { translate } = useLocales();
  const { rowsPerPageOptionsDefault } = useGlobalPostsPerPage();

  return (
    <Box sx={{ ...sx }} className="blog-pagination">
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptionsDefault}
        component="div"
        {...other}
      />

      {onChangeDense && (
        <FormControlLabel
          className="blog-pagination__form"
          label={`${translate('nav.dense')}`}
          control={<Switch checked={dense} onChange={onChangeDense} />}
        />
      )}
    </Box>
  );
}
