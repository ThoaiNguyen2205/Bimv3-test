// @mui
import { TableRow, TableCell } from '@mui/material';
//
import EmptyContent from '../empty-content';
// locales
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  isNotFound: boolean;
};

export default function TableNoData({ isNotFound }: Props) {
  const { translate } = useLocales();
  return (
    <TableRow>
      {isNotFound ? (
        <TableCell colSpan={12}>
          <EmptyContent
            title={`${translate('common.no_data')}`}
            sx={{
              '& span.MuiBox-root': { height: 160 },
            }}
          />
        </TableCell>
      ) : (
        <TableCell colSpan={12} sx={{ p: 0 }} />
      )}
    </TableRow>
  );
}
