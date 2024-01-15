// @mui
import { TextField, InputAdornment } from '@mui/material';
// components
import Iconify from 'src/components/iconify';
// locales
import { useLocales } from 'src/locales';
// ----------------------------------------------------------------------

type Props = {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function UserFilterName({ filterName, onFilterName }: Props) {
  const { translate } = useLocales();
  return (
    <TextField
      size="small"
      value={filterName}
      onChange={onFilterName}
      placeholder={`${translate('common.search')}`}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        ),
      }}
    />
  );
}
