import { sentenceCase } from 'change-case';
// @mui
import {
  Stack,
  Button,
  Select,
  MenuItem,
  Checkbox,
  TextField,
  InputLabel,
  FormControl,
  OutlinedInput,
  InputAdornment,
  Box,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
// components
import Iconify from '../../../../components/iconify';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  isFiltered: boolean;
  filterName: string;
  filterStatus: string[];
  statusOptions: {
    value: string;
    label: string;
  }[];
  onResetFilter: VoidFunction;
  onFilterStatus: (event: SelectChangeEvent<string[]>) => void;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ProductTableToolbar({
  isFiltered,
  filterName,
  filterStatus,
  onFilterName,
  statusOptions,
  onResetFilter,
  onFilterStatus,
}: Props) {
  const { translate } = useLocales();
  return (
    <Stack
      spacing={2}
      alignItems="center"
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{ py: { xs: 1, md: 3 } }}
    >
      <FormControl
        sx={{
          width: { xs: 1, md: 240 },
        }}
        size="small"
      >
        <InputLabel sx={{ '&.Mui-focused': { color: 'text.primary' } }}>{`${translate(
          'documents.category'
        )}`}</InputLabel>
        <Select
          multiple
          value={filterStatus}
          onChange={onFilterStatus}
          input={<OutlinedInput label="Status" />}
          renderValue={(selected) => selected.map((value) => sentenceCase(value)).join(', ')}
        >
          {statusOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{
                p: 0,
                mx: 1,
                borderRadius: 0.75,
                typography: 'body2',
                textTransform: 'capitalize',
              }}
            >
              <Checkbox disableRipple size="small" checked={filterStatus.includes(option.value)} />
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        sx={{ marginLeft: '8px!important' }}
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
    </Stack>
  );
}
