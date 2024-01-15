// @mui
import { Stack, InputAdornment, TextField, MenuItem, Button } from '@mui/material';
// components
import Iconify from 'src/components/iconify';
// Locales
import { useLocales } from 'src/locales';
// ----------------------------------------------------------------------

type Props = {
  filterName: string;
  isFiltered: boolean;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetFilter: VoidFunction;
};

export default function TaskTableToolbar({
  filterName,
  isFiltered,
  onFilterName,
  onResetFilter,
}: Props) {
  const { translate } = useLocales();

  return (
    <Stack
      spacing={2}
      alignItems="center"
      direction={{
        xs: 'column',
        sm: 'row',
      }}
      sx={{ px: 2.5, py: 3 }}
    >
      <TextField
        size='small'
        fullWidth
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

      {isFiltered && (
        <Button
          color="error"
          sx={{ flexShrink: 0 }}
          onClick={onResetFilter}
          startIcon={<Iconify icon="eva:trash-2-outline" />}
        >
          {`${translate('common.clear')}`}
        </Button>
      )}
    </Stack>
  );
}
