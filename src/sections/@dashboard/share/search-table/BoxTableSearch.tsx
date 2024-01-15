// @mui
import {
  Stack,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  OutlinedInput,
  InputAdornment,
  Box
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
// components
import Iconify from '../../../../components/iconify';
import { useLocales } from '../../../../locales';
import { TableProps } from '../../../../components/table';
import DateRangePicker from '../../../../components/date-range-picker/DateRangePicker';
import BoxPostsSort from './filter/BoxPostsSort';
import FilterButton from './filter/FilterButton';
// ----------------------------------------------------------------------

type Props = {
  datePicker: any;
  isFiltered: boolean;
  keySearch: string;
  filterCategory: string;
  sortOptions: { value: string; label: string }[];
  categoryOptions: { value: string; label: string }[];
  table: TableProps;
  sortBy: string;
  getAllSearch: VoidFunction;
  handleSearchKeyName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeSortBy: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilterCategory: (event: SelectChangeEvent<string>) => void;
  resetForm: VoidFunction;
};
export default function BoxTableSearch({
  datePicker,
  isFiltered,
  table,
  keySearch,
  filterCategory,
  sortOptions,
  categoryOptions,
  getAllSearch,
  handleSearchKeyName,
  handleChangeSortBy,
  resetForm,
  handleFilterCategory,
  sortBy
}: Props) {
  const { translate } = useLocales();
  const { setPage } = table;
  const {
    startDate,
    endDate,
    onChangeStartDate,
    onChangeEndDate,
    open: openPicker,
    onOpen: onOpenPicker,
    onClose: onClosePicker,
    onReset: onResetPicker,
    isSelected: isSelectedValuePicker,
    isError,
    shortLabel,
    isNotStartDate,
    isNotEndDate
  } = datePicker;
  return (
    <Box className="search-form">
      <Stack className="search-form__content">
        <Box className="search-form__sort-item">
          <BoxPostsSort
            sortBy={sortBy}
            sortOptions={sortOptions}
            onSort={handleChangeSortBy}
          />
        </Box>
        <FormControl className="search-form__sort-status" size="small">
          <InputLabel
            sx={{ '&.Mui-focused': { color: 'text.primary' } }}
            className="search-form__status-label">{`${translate(
            'documents.category'
          )}`}</InputLabel>
          <Select
            size="small"
            className="search-form__status-select"
            // multiple
            value={filterCategory}
            onChange={handleFilterCategory}
            label={`${translate('documents.category')}`}
            input={
              <OutlinedInput label={`${translate('documents.category')}`} />
            }
            // renderValue={(selected) => selected}
            // renderValue={(selected) => selected.map((value) => value).join(', ')}
          >
            <MenuItem value={'all'}>{`${translate('common.none')}`}</MenuItem>
            {categoryOptions.map((option) => (
              <MenuItem
                className="status__select-item"
                key={option.value}
                value={option.value}>
                {/* <Checkbox
                disableRipple
                size="small"
                checked={filterCategory.includes(option.value)}
              /> */}
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          className="search-form__key"
          fullWidth
          size="small"
          value={keySearch}
          onChange={handleSearchKeyName}
          placeholder={`${translate('cloud.key')}`}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  className="search-form__key-icon"
                  icon="eva:search-fill"
                />
              </InputAdornment>
            )
          }}
        />
        <FilterButton
          startIcon={<Iconify icon="eva:calendar-fill" />}
          onClick={onOpenPicker}
          variant="outlined"
          className={`search-form__calendar ${
            !!isSelectedValuePicker && 'form__calendar-active'
          }`}>
          {isSelectedValuePicker
            ? shortLabel
            : `${translate('common.select_date')}`}
        </FilterButton>
        <DateRangePicker
          variant="input"
          startDate={startDate}
          endDate={endDate}
          onChangeStartDate={onChangeStartDate}
          onChangeEndDate={onChangeEndDate}
          open={openPicker}
          onReset={onResetPicker}
          onClose={onClosePicker}
          isSelected={isSelectedValuePicker}
          isError={isError}
          isNotStartDate={isNotStartDate}
          isNotEndDate={isNotEndDate}
        />
        {isFiltered ? (
          <Box className="search-form__button">
            <Button
              className="search-form__button-icon icon-search"
              variant="contained"
              color="success"
              // sx={{ flexShrink: 0 }}
              onClick={() => {
                getAllSearch();
              }}
              startIcon={<Iconify icon="eva:search-fill" />}>
              {`${translate('common.search')}`}
            </Button>{' '}
            <Button
              className="search-form__button-icon icon-clear"
              variant="outlined"
              color="error"
              // sx={{ flexShrink: 0 }}
              onClick={resetForm}
              startIcon={<Iconify icon="eva:trash-2-outline" />}>
              {`${translate('common.clear')}`}
            </Button>
          </Box>
        ) : (
          <Button
            className="search-form__button icon-search"
            variant="contained"
            color="success"
            // sx={{ flexShrink: 0 }}
            onClick={getAllSearch}
            startIcon={<Iconify icon="eva:search-fill" />}>
            {`${translate('common.search')}`}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
