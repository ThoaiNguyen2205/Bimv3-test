// @mui
import { Theme } from '@mui/material/styles';
import {
  Box,
  SxProps,
  TablePagination,
  TablePaginationProps,
  Button
} from '@mui/material';
//locales
import { useLocales } from '../../../../locales';
//store
import useGlobal from '../../../../redux/globalStore';
//component
import Iconify from '../../../../components/iconify/Iconify';
// ----------------------------------------------------------------------

type Props = {
  onClose: VoidFunction;
  sx?: SxProps<Theme>;
};

export default function CommentPaginationCustom({
  onClose,
  sx,
  ...other
}: Props & TablePaginationProps) {
  const { translate } = useLocales();
  const { rowsPerPageOptionsDefault } = useGlobal();

  return (
    <Box className="comments__pagination-box">
      {onClose && (
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="material-symbols:cancel-outline" />}
          onClick={onClose}>
          {`${translate('common.close')}`}
        </Button>
      )}
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptionsDefault}
        component="div"
        {...other}
      />
    </Box>
  );
}
