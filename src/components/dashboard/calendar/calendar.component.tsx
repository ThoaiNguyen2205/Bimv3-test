import React from 'react';
//mui
import FullCalendar from '@fullcalendar/react';
import {
  Box,
  Button,
  Card,
  Container,
  Dialog,
  DialogTitle
} from '@mui/material';
//fullcalendar
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
//context
import { useSettingsContext } from '../../../components/settings';
//router
import { PATH_DASHBOARD } from '../../../routes/paths';
//hooks
import useResponsive from '../../../hooks/useResponsive';
//locales
import { useLocales } from '../../../locales';
//stores
import useCalendarStore from '../../../redux/calendarStore/calendarStore';
import { shallow } from 'zustand/shallow';
//types
import {
  ICalendarAttribute,
  ICalendarFunction
} from '../../../containers/dashboard/calendar/calendar.container';
//components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs/CustomBreadcrumbs';
import Iconify from '../../../components/iconify';
//sections
import {
  CalendarFilterDrawer,
  CalendarForm,
  CalendarToolbar,
  StyledCalendar
} from '../../../sections/@dashboard/calendar';

//--------------------------------------------
type ICalendarProps = {
  props: ICalendarAttribute;
  func: ICalendarFunction;
};
//--------------------------------------------

export default function CalendarComponent({ props, func }: ICalendarProps) {
  const {
    // filterEventColor,
    setSelectedEvent,
    setOpenForm,
    setSelectedEventId,
    handleFilterEventColor
  } = useCalendarStore(
    (state) => ({
      // filterEventColor: state.filterEventColor,
      setSelectedEvent: state.setSelectedData,
      setOpenForm: state.setOpenForm,
      setSelectedEventId: state.setSelectedEventId,
      handleFilterEventColor: state.handleFilterEventColor
    }),
    shallow
  );
  const { translate, currentLang } = useLocales();
  const { themeStretch } = useSettingsContext();
  const isDesktop = useResponsive('up', 'sm');
  return (
    <Box className="calendar">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          className="calendar__breadcrumbs breadcrumbs"
          heading={`${translate('nav.calendar')}`}
          links={[
            {
              name: `${translate('nav.dashboard')}`,
              href: PATH_DASHBOARD.root
            },
            {
              name: `${translate('nav.calendar')}`
            }
          ]}
          action={
            <Button
              className="calendar__breadcrumbs-action breadcrumbs__action"
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => {
                setSelectedEvent(null);
                setOpenForm(true);
              }}>
              {`${translate('calendar.new_event')}`}
            </Button>
          }
        />

        <Card className="calendar__card">
          <StyledCalendar className="calendar__card-styled">
            <CalendarToolbar
              date={props.localState.date}
              view={props.view}
              onNextDate={func.handleClickDateNext}
              onPrevDate={func.handleClickDatePrev}
              onToday={func.handleClickToday}
              onChangeView={func.handleChangeView}
            />

            <FullCalendar
              locale={
                (currentLang.value === 'en' && 'en') ||
                (currentLang.value === 'vi' && 'vi') ||
                'en'
              }
              weekends
              editable
              droppable
              selectable
              rerenderDelay={10}
              allDayMaintainDuration
              eventResizableFromStart
              ref={props.calendarRef}
              initialDate={props.localState.date}
              initialView={props.view}
              dayMaxEventRows={3}
              eventDisplay="block"
              events={props.dataFiltered}
              headerToolbar={false}
              initialEvents={props.events}
              select={func.handleSelectRange}
              eventDrop={func.handleDropEvent}
              eventClick={func.handleSelectEvent}
              eventResize={func.handleResizeEvent}
              height={isDesktop ? 720 : 'auto'}
              plugins={[
                listPlugin,
                dayGridPlugin,
                timelinePlugin,
                timeGridPlugin,
                interactionPlugin
              ]}
            />
          </StyledCalendar>
        </Card>
      </Container>

      <Dialog
        fullWidth
        maxWidth="md"
        open={props.openForm}
        onClose={func.handleCloseModal}>
        <DialogTitle>
          {props.selectedEvent
            ? `${translate('calendar.edit_event')}`
            : `${translate('calendar.add_event')}`}
        </DialogTitle>

        <CalendarForm
          event={props.selectedEvent}
          range={props.localState.selectedRange}
          onCancel={func.handleCloseModal}
          onCreateUpdateEvent={func.handleCreateUpdateEvent}
          onDeleteEvent={func.handleDeleteEvent}
          colorOptions={props.COLOR_OPTIONS}
        />
      </Dialog>

      <CalendarFilterDrawer
        events={props.dataFiltered}
        picker={props.picker}
        // openFilter={openFilter}
        colorOptions={props.COLOR_OPTIONS}
        onResetFilter={func.handleResetFilter}
        // filterEventColor={filterEventColor}
        onFilterEventColor={handleFilterEventColor}
        onSelectEvent={(eventId) => {
          if (eventId) {
            setOpenForm(true);
            setSelectedEventId(eventId);
          }
        }}
      />
    </Box>
  );
}
