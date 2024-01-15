import { useState } from 'react';
// @mui
import {
  Stack,
  Button,
  Typography,
  IconButton,
  MenuItem,
  Tooltip
} from '@mui/material';
// utils
import { fDate, fDateVi } from '../../../utils/formatTime';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// @types
import { ICalendarViewValue } from '../../../@types/calendar';
// components
import Iconify from '../../../components/iconify';
import MenuPopover from '../../../components/menu-popover';
import { useLocales } from 'src/locales';
import useCalendarStore from 'src/redux/calendarStore/calendarStore';
import { shallow } from 'zustand/shallow';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type Props = {
  date: Date;
  view: ICalendarViewValue;
  onToday: VoidFunction;
  onNextDate: VoidFunction;
  onPrevDate: VoidFunction;
  onChangeView: (newView: ICalendarViewValue) => void;
};

export default function CalendarToolbar({
  date,
  view,
  onToday,
  onNextDate,
  onPrevDate,
  onChangeView
}: Props) {
  const isDesktop = useResponsive('up', 'sm');
  const { translate, currentLang } = useLocales();
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const { setOpenFilter } = useCalendarStore(
    (state) => ({
      setOpenFilter: state.setOpenFilter
    }),
    shallow
  );
  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };
  const VIEW_OPTIONS = [
    {
      value: 'dayGridMonth',
      label: `${translate('calendar.month')}`,
      icon: 'ic:round-view-module'
    },
    {
      value: 'timeGridWeek',
      label: `${translate('calendar.week')}`,
      icon: 'ic:round-view-week'
    },
    {
      value: 'timeGridDay',
      label: `${translate('calendar.day')}`,
      icon: 'ic:round-view-day'
    },
    {
      value: 'listWeek',
      label: `${translate('calendar.agenda')}`,
      icon: 'ic:round-view-agenda'
    }
  ] as const;
  const selectedItem = VIEW_OPTIONS.filter((item) => item.value === view)[0];
  return (
    <>
      <Stack className="calendar-toolbar">
        {isDesktop && (
          <Button
            className="calendar-toolbar__button-view"
            onClick={handleOpenPopover}
            startIcon={
              <Iconify
                icon={selectedItem.icon}
                className="button-view__start-icon"
              />
            }
            endIcon={
              <Iconify
                icon="eva:chevron-down-fill"
                className="button-view__end-icon"
              />
            }>
            {selectedItem.label}
          </Button>
        )}

        <Stack className="calendar-toolbar__date">
          <IconButton
            onClick={onPrevDate}
            className="calendar-toolbar__date-prev">
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Typography variant="h6" className="calendar-toolbar__date-text">
            {(currentLang.value === 'en' && fDate(date)) ||
              (currentLang.value === 'vi' && fDateVi(date)) ||
              fDate(date)}
          </Typography>

          <IconButton
            onClick={onNextDate}
            className="calendar-toolbar__date-next">
            <Iconify icon="eva:arrow-ios-forward-fill" />
          </IconButton>
        </Stack>

        <Stack className="calendar-toolbar__action">
          <Button
            className="calendar-toolbar__action-button"
            size="small"
            color="error"
            variant="contained"
            onClick={onToday}>
            {`${translate('calendar.today')}`}
          </Button>
          <Tooltip
            className="calendar-toolbar__action-filter"
            placement="bottom"
            title={`${translate('calendar.filter_events')}`}>
            <IconButton
              className="filter__buton"
              onClick={() => setOpenFilter(true)}>
              <Iconify icon="ic:round-filter-list" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <MenuPopover
        className="menu-popover"
        open={openPopover}
        onClose={handleClosePopover}
        arrow="top-left"
        sx={{ width: 160 }}>
        {VIEW_OPTIONS.map((viewOption) => (
          <MenuItem
            key={viewOption.value}
            onClick={() => {
              handleClosePopover();
              onChangeView(viewOption.value);
            }}
            sx={{
              ...(viewOption.value === view && {
                bgcolor: 'action.selected'
              })
            }}>
            <Iconify icon={viewOption.icon} />
            {viewOption.label}
          </MenuItem>
        ))}
      </MenuPopover>
    </>
  );
}
