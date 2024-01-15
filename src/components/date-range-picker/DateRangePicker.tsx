// @mui
import {
  Paper,
  Stack,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormHelperText,
  Box
} from '@mui/material';
import {
  DatePicker,
  CalendarPicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
// hooks
import useResponsive from '../../hooks/useResponsive';
//
import { DateRangePickerProps } from './types';

// uselocales
import { useLocales } from '../../locales';
// components
import Iconify from '../iconify/Iconify';
import vi from 'date-fns/locale/vi';
import en from 'date-fns/locale/en-US';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// ----------------------------------------------------------------------

export default function DateRangePicker({
  title,
  variant,
  //
  startDate,
  endDate,
  //
  onChangeStartDate,
  onChangeEndDate,
  //
  open,
  onClose,
  onReset,
  //
  isError,
  isNotEndDate,
  isNotStartDate
}: DateRangePickerProps) {
  const isDesktop = useResponsive('up', 'md');
  const { translate, currentLang } = useLocales();
  const isCalendarView = variant === 'calendar';
  const disableApply = isError || isNotStartDate || isNotEndDate;
  const closeDatePicker = () => {
    onClose();
    if (onReset) {
      onReset();
    }
  };
  return (
    <Dialog
      className="date-picker"
      fullWidth
      maxWidth={isCalendarView ? false : 'xs'}
      open={open}
      onClose={closeDatePicker}
      PaperProps={{
        sx: {
          ...(isCalendarView && {
            maxWidth: 720
          })
        }
      }}>
      <DialogTitle className="date-picker__title">{`${translate(
        'common.select_date_range'
      )}`}</DialogTitle>

      <DialogContent
        className={`date-picker__content ${
          isCalendarView && isDesktop && 'date-picker__content-calendar'
        }`}
        sx={
          {
            // ...(isCalendarView &&
            //   isDesktop && {
            //     overflow: 'unset'
            //   })
          }
        }>
        <Stack
          className="date-picker__form"
          spacing={isCalendarView ? 3 : 2}
          direction={isCalendarView && isDesktop ? 'row' : 'column'}
          justifyContent="center"
          sx={{
            // pt: 1,
            '& .MuiCalendarPicker-root': {
              ...(!isDesktop && {
                width: 'auto'
              })
            }
          }}>
          {isCalendarView ? (
            <>
              <Paper className="date-picker__calendar-item" variant="outlined">
                <CalendarPicker date={startDate} onChange={onChangeStartDate} />
              </Paper>
              <Paper className="date-picker__calendar-item" variant="outlined">
                <CalendarPicker date={endDate} onChange={onChangeEndDate} />
              </Paper>
            </>
          ) : (
            <>
              <LocalizationProvider
                locale={currentLang.value === 'vi' ? vi : en}
                dateAdapter={AdapterDateFns}>
                <DatePicker
                  className="date-picker__input-item"
                  label={`${translate('cloud.start_date')}`}
                  value={startDate}
                  onChange={onChangeStartDate}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
              <LocalizationProvider
                locale={currentLang.value === 'vi' ? vi : en}
                dateAdapter={AdapterDateFns}>
                <DatePicker
                  className="date-picker__input-item"
                  label={`${translate('cloud.end_date')}`}
                  value={endDate}
                  onChange={onChangeEndDate}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </>
          )}
        </Stack>
        <FormHelperText error className="date-picker__error">
          {(isNotStartDate && `${translate('cloud.start_date_error')}`) ||
            (isNotEndDate && `${translate('cloud.end_date_error')}`) ||
            (isError && `${translate('cloud.date_range_note')}`)}
        </FormHelperText>
      </DialogContent>

      <DialogActions className="date-picker__actions">
        {/* <Button variant="outlined" color="inherit" onClick={onClose}>
          {`${translate('common.cancel')}`}
        </Button>

        <Button disabled={isError} variant="contained" onClick={onClose}></Button>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          startIcon={<Iconify icon="mdi:exit-to-app" />}
        >
          {`${translate('common.close')}`}
        </Button> */}
        <Box className="date-picker__actions-left">
          <Button
            className="action__button-close"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="material-symbols:cancel-outline" />}
            onClick={closeDatePicker}>
            {`${translate('common.close')}`}
          </Button>
        </Box>
        <Box className="date-picker__actions-right">
          <Button
            className="action__button-apply"
            disabled={disableApply}
            variant="contained"
            onClick={onClose}
            startIcon={<Iconify icon="bi:check" />}>
            {`${translate('common.apply')}`}
          </Button>
          {startDate !== null || endDate !== null ? (
            <Button
              className="action__button-clear"
              // disabled={disableApply}
              variant="contained"
              color="error"
              onClick={onReset}
              startIcon={<Iconify icon="eva:trash-2-outline" />}>
              {`${translate('common.clear')}`}
            </Button>
          ) : null}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
