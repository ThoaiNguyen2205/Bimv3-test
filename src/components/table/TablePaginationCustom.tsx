import { ChangeEvent } from 'react';
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
import { useLocales } from '../../locales';
import useGlobal from '../../redux/globalStore';
// ----------------------------------------------------------------------

type Props = {
  dense?: boolean;
  onChangeDense?: false | ((event: ChangeEvent<HTMLInputElement>) => void);
  sx?: SxProps<Theme>;
};

export default function TablePaginationCustom({
  dense,
  onChangeDense,
  // rowsPerPageOptions = [5, 10, 20, 50, 100],
  sx,
  ...other
}: Props & TablePaginationProps) {
  const { translate } = useLocales();
  const { rowsPerPageOptionsDefault } = useGlobal();

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptionsDefault}
        component="div"
        {...other}
      />

      {onChangeDense && (
        <FormControlLabel
          label={`${translate('nav.dense')}`}
          control={<Switch checked={dense} onChange={onChangeDense} />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
            position: 'absolute'
          }}
        />
      )}
    </Box>
  );
}
