import orderBy from 'lodash/orderBy';
import { EventInput } from '@fullcalendar/core';
// @mui
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  Box,
  Stack,
  Drawer,
  Divider,
  Tooltip,
  TextField,
  Typography,
  IconButton,
  ListItemText,
  ListItemButton
} from '@mui/material';
// utils
import { fDateTime, fDateTimeVi } from '../../../utils/formatTime';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import { ColorMultiPicker } from '../../../components/color-utils';
import { DateRangePickerProps } from '../../../components/date-range-picker';
import { useLocales } from 'src/locales';
import useCalendarStore from 'src/redux/calendarStore/calendarStore';
import { shallow } from 'zustand/shallow';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import vi from 'date-fns/locale/vi';
import en from 'date-fns/locale/en-US';

// ----------------------------------------------------------------------

type Props = {
  events: EventInput[];
  onResetFilter: VoidFunction;
  colorOptions: string[];

  picker: DateRangePickerProps;
  onSelectEvent: (eventId: string) => void;
  onFilterEventColor: (eventColor: string) => void;
};

export default function CalendarFilterDrawer({
  events,
  picker,
  colorOptions,
  onResetFilter,
  onSelectEvent,
  onFilterEventColor
}: Props) {
  const { translate, currentLang } = useLocales();
  const { openFilter, setOpenFilter, filterEventColor } = useCalendarStore(
    (state) => ({
      openFilter: state.openFilter,
      setOpenFilter: state.setOpenFilter,
      filterEventColor: state.filterEventColor
    }),
    shallow
  );
  const notDefault =
    (picker.startDate && picker.endDate) || !!filterEventColor.length;
  return (
    <Drawer
      className="calendar-filter"
      anchor="right"
      open={openFilter}
      onClose={() => setOpenFilter(false)}
      BackdropProps={{
        invisible: true
      }}
      PaperProps={{
        sx: { width: 320 }
      }}>
      <Stack className="calendar-filter__header">
        <Typography
          variant="subtitle1"
          className="calendar-filter__header-title">{`${translate(
          'calendar.filter_events'
        )}`}</Typography>

        <Tooltip title={`${translate('common.clear')}`}>
          <Box className="calendar-filter__header-action">
            <IconButton onClick={onResetFilter} className="action__button">
              <Iconify icon="ic:round-refresh" />
            </IconButton>

            {notDefault && <Box className="action__icon" />}
          </Box>
        </Tooltip>
      </Stack>

      <Divider />
      <Box className="calendar-filter__colors">
        <Typography className="calendar-filter__colors-title" variant="caption">
          {`${translate('calendar.event_colors')}`}
        </Typography>

        <ColorMultiPicker
          className="calendar-filter__colors-select"
          colors={colorOptions}
          selected={filterEventColor}
          onChangeColor={onFilterEventColor}
        />
      </Box>
      <Box className="calendar-filter__range">
        <Typography className="calendar-filter__range-title" variant="caption">
          {`${translate('common.range')}`}
        </Typography>
        <Stack className="calendar-filter__range-form">
          <LocalizationProvider
            locale={currentLang.value === 'vi' ? vi : en}
            dateAdapter={AdapterDateFns}>
            <DatePicker
              label={`${translate('cloud.start_date')}`}
              value={picker.startDate}
              onChange={picker.onChangeStartDate}
              renderInput={(params) => <TextField size="small" {...params} />}
            />
          </LocalizationProvider>
          <LocalizationProvider
            locale={currentLang.value === 'vi' ? vi : en}
            dateAdapter={AdapterDateFns}>
            <DatePicker
              label={`${translate('cloud.end_date')}`}
              value={picker.endDate}
              onChange={picker.onChangeEndDate}
              renderInput={(params) => (
                <TextField
                  size="small"
                  {...params}
                  error={picker.isError}
                  helperText={
                    picker.isError && `${translate('cloud.date_range_note')}`
                  }
                />
              )}
            />
          </LocalizationProvider>
        </Stack>
      </Box>
      <Box className="calendar-filter__events">
        <Typography className="calendar-filter__events-title" variant="caption">
          {`${translate('calendar.events')}`} ({events.length})
        </Typography>
        <Scrollbar className="calendar-filter__events-list">
          {orderBy(events, ['end'], ['desc']).map((event) => (
            <ListItemButton
              className="item"
              key={event.id}
              onClick={() => onSelectEvent(event.id as string)}>
              <Box
                className="item__color"
                sx={{
                  borderTop: `10px solid ${event.color}`
                }}
              />

              <ListItemText
                className="item__text"
                disableTypography
                primary={
                  <Typography className="event__text-title" variant="subtitle2">
                    {event.title}
                  </Typography>
                }
                secondary={
                  <Typography
                    className="item__text-date"
                    variant="caption"
                    component="div">
                    {event.allDay ? (
                      (currentLang.value === 'en' &&
                        fDateTime(event.start as Date, 'dd MMMM yy')) ||
                      (currentLang.value === 'vi' &&
                        fDateTimeVi(event.start as Date, 'dd MMMM yy')) ||
                      fDateTime(event.start as Date, 'dd MMM yy')
                    ) : (
                      <>
                        {currentLang.value === 'vi'
                          ? `${fDateTimeVi(
                              event.start as Date,
                              'dd MM yyyy p'
                            )} - ${fDateTimeVi(
                              event.end as Date,
                              'dd MM yyyy p'
                            )}`
                          : `${fDateTime(
                              event.start as Date,
                              'dd MMM yy p'
                            )} - ${fDateTime(
                              event.end as Date,
                              'dd MMM yy p'
                            )}`}
                      </>
                    )}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </Scrollbar>
      </Box>
    </Drawer>
  );
}
