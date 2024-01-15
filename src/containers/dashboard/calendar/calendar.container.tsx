import React, {
  Dispatch,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  OptionsObject,
  SnackbarKey,
  SnackbarMessage,
  useSnackbar
} from 'notistack';
//mui
import {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  EventInput
} from '@fullcalendar/core';
//fullcalendar
import { EventResizeDoneArg } from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
//types
import { ICalendarViewValue } from '.././../../@types/calendar';
import {
  ICalendarEvent,
  ICalendarEventReqCreate
} from '.././../../shared/types/calendar';
import {
  IDocCategory,
  IDocCategoryResGetAll
} from '.././../../shared/types/docCategory';
//utils
import { fTimestamp } from '.././../../utils/formatTime';
//hook
import useResponsive from '.././../../hooks/useResponsive';
import { deleteEvent, updateEvent } from '.././../../redux/slices/calendar';
//store
import { shallow } from 'zustand/shallow';
import useCalendarStore from '.././../../redux/calendarStore/calendarStore';
import useDocCategory from '.././../../redux/docCategoryStore';
import axios from '../../../utils/axios';
import { AnyAction } from 'redux';
import { useDispatch, useSelector } from '.././../../redux/store';
import { ThunkDispatch } from '@reduxjs/toolkit';
import CalendarComponent from '.././../../components/dashboard/calendar/calendar.component';
import {
  DateRangePickerProps,
  useDateRangePicker
} from '.././../../components/date-range-picker';
//apis
import docCategoriesApi from '.././../../api/docCategoriesApi';
//-----------------------------------------------
export type ICalendarAttribute = {
  isDesktop: boolean;
  COLOR_OPTIONS: string[];
  localState: ILocalState;
  setLocalState: React.Dispatch<React.SetStateAction<ILocalState>>;
  dispatch: ThunkDispatch<any, undefined, AnyAction> & Dispatch<AnyAction>;
  calendarRef: React.RefObject<FullCalendar>;
  picker: DateRangePickerProps;
  events: ICalendarEvent[];
  openForm: boolean;
  setEvents: (bimCalendar: ICalendarEvent[]) => void;
  selectedEvent: ICalendarEvent | null | undefined;
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined
  ) => SnackbarKey;
  setOpenForm: (value: boolean) => void;
  view: ICalendarViewValue;
  setView: (value: ICalendarViewValue) => void;
  setFilterEventColor: (value: string[]) => void;
  selectedEventId: string | null;
  setSelectedEventId: (newValue: string | null) => void;
  filterEventColor: string[];
  dataFiltered: EventInput[];
  blogCategories: IDocCategory[];
  setDocCategories: (docCategories: IDocCategory[]) => void;
};
export type ICalendarFunction = {
  getAllEvents: () => Promise<void>;
  handleOpenFilter: (value: boolean) => void;
  handleCloseModal: () => void;
  handleClickToday: () => void;
  handleChangeView: (newView: ICalendarViewValue) => void;
  handleClickDatePrev: () => void;
  handleClickDateNext: () => void;
  handleSelectRange: (arg: DateSelectArg) => void;
  handleSelectEvent: (arg: EventClickArg) => void;
  handleResetFilter: () => void;
  handleDropEvent: ({ event }: EventDropArg) => void;
  handleResizeEvent: ({ event }: EventResizeDoneArg) => void;
  handleCreateUpdateEvent: (newEvent: any) => void;
  handleDeleteEvent: () => void;
  loadAllDocCategories: () => Promise<void>;
};
type ILocalState = {
  selectedCategorytId: string;
  selectedRange: {
    start: Date;
    end: Date;
  } | null;
  date: Date;
};
//------------------------------------------------
const calendarAttribute = (): ICalendarAttribute => {
  const isDesktop = useResponsive('up', 'sm');
  const COLOR_OPTIONS = [
    '#00AB55', // theme.palette.primary.main,
    '#1890FF', // theme.palette.info.main,
    '#54D62C', // theme.palette.success.main,
    '#FFC107', // theme.palette.warning.main,
    '#FF4842', // theme.palette.error.main
    '#04297A', // theme.palette.info.darker
    '#7A0C2E' // theme.palette.error.darker
  ];
  const [localState, setLocalState] = useState<ILocalState>({
    selectedCategorytId: '',
    selectedRange: null,
    date: new Date()
  });
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const calendarRef = useRef<FullCalendar>(null);
  const picker = useDateRangePicker(null, null);

  const {
    events,
    openForm,
    view,
    // selectedEvent,
    selectedEventId,
    setEvents,
    setOpenForm,
    setView,
    setFilterEventColor,
    setSelectedEventId,
    filterEventColor
    // setSelectedEvent
  } = useCalendarStore(
    (state) => ({
      events: state.datas,
      openForm: state.openForm,
      // selectedEvent: state.selectedData,
      view: state.view,
      selectedEventId: state.selectedEventId,
      setEvents: state.setDatas,
      setOpenForm: state.setOpenForm,
      setView: state.setView,
      setFilterEventColor: state.setFilterEventColor,
      setSelectedEventId: state.setSelectedEventId,
      filterEventColor: state.filterEventColor
      // selectedEvent: state.selectedData,
      // setSelectedEvent: state.setSelectedData
    }),
    shallow
  );
  const { blogCategories, setDocCategories } = useDocCategory(
    (state) => ({
      blogCategories: state.datas,
      setDocCategories: state.setDatas
    }),
    shallow
  );
  const selectedEvent = useSelector(() => {
    if (selectedEventId) {
      return events.find((event) => event.id === selectedEventId);
    }
    return null;
  });
  const dataFiltered = applyFilter({
    inputData: events,
    filterEventColor: filterEventColor,
    filterStartDate: picker.startDate,
    filterEndDate: picker.endDate,
    isError: !!picker.isError
  });
  return {
    COLOR_OPTIONS,
    localState,
    setLocalState,
    dispatch,
    calendarRef,
    picker,
    events,
    openForm,
    view,
    setEvents,
    setOpenForm,
    selectedEvent,
    setView,
    isDesktop,
    enqueueSnackbar,
    setFilterEventColor,
    selectedEventId,
    setSelectedEventId,
    filterEventColor,
    dataFiltered,
    blogCategories,
    setDocCategories
  };
};
const calendarFunction = ({
  props,
  state,
  setState
}: {
  props: ICalendarAttribute;
  state: ILocalState;
  setState: Function;
}): ICalendarFunction => {
  /* ================= HANDLE API ===================*/
  // handle get all Event
  const getAllEvents = async () => {
    const res = await axios.get('/api/calendar/events');
    const events = res.data.events.map((event: any) => ({
      ...event,
      textColor: event.color
    }));
    props.setEvents(events);
  };
  const loadAllDocCategories = useCallback(async () => {
    const apiRes: IDocCategoryResGetAll =
      await docCategoriesApi.getAllDocCategories(null);
    props.setDocCategories(apiRes.data);
  }, []);
  /* ================= HANDLE LOCAL ===================*/
  //handle open filter
  const handleOpenFilter = (value: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openFilter: value
    }));
  };
  const handleCloseModal = () => {
    props.setOpenForm(false);
    setState((prevState: ILocalState) => ({
      ...prevState,
      // openForm: false,
      selectedRange: null
      // selectedEventId: null
    }));
    props.setSelectedEventId(null);
  };
  // handle clik Today
  const handleClickToday = () => {
    const calendarEl = props.calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setState((prevState: ILocalState) => ({
        date: calendarApi.getDate()
      }));
    }
  };
  //handle Change view
  const handleChangeView = (newView: ICalendarViewValue) => {
    const calendarEl = props.calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.changeView(newView);
      props.setView(newView);
    }
  };
  //handle prev/next date
  const handleClickDatePrev = () => {
    const calendarEl = props.calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setState((prevState: ILocalState) => ({
        ...prevState,
        date: calendarApi.getDate()
      }));
    }
  };

  const handleClickDateNext = () => {
    const calendarEl = props.calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setState((prevState: ILocalState) => ({
        ...prevState,
        date: calendarApi.getDate()
      }));
    }
  };
  //handle select Ranger Picker
  const handleSelectRange = (arg: DateSelectArg) => {
    const calendarEl = props.calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.unselect();
    }
    props.setOpenForm(true);
    setState((prevState: ILocalState) => ({
      ...prevState,
      selectedRange: {
        start: arg.start,
        end: arg.end
      }
    }));
  };
  // handle select Event
  const handleSelectEvent = (arg: EventClickArg) => {
    props.setOpenForm(true);
    // // setState((prevState: ILocalState) => ({
    // //   selectedEventId: arg.event.id
    // // }));
    // if (arg.event.id === null) {
    //   props.setSelectedEvent(null);
    // } else {
    //   const findEvent = props.events.find((event) => event.id === arg.event.id);
    //   props.setSelectedEvent(findEvent);
    // }
    props.setSelectedEventId(arg.event.id);
  };

  //handle filter event
  // const handleFilterEventColor = (eventColor: string) => {
  //   const checked = props.localState.filterEventColor.includes(eventColor)
  //     ? props.localState.filterEventColor.filter(
  //         (value) => value !== eventColor
  //       )
  //     : [...props.localState.filterEventColor, eventColor];
  //   setState((prevState: ILocalState) => ({
  //     ...prevState,
  //     filterEventColor: checked
  //   }));
  // };
  //handle reset filter
  const handleResetFilter = () => {
    const { setStartDate, setEndDate } = props.picker;

    if (setStartDate && setEndDate) {
      setStartDate(null);
      setEndDate(null);
    }
    props.setFilterEventColor([]);
  };
  const handleDropEvent = ({ event }: EventDropArg) => {
    try {
      props.dispatch(
        updateEvent(event.id, {
          allDay: event.allDay,
          start: event.start,
          end: event.end
        })
      );
    } catch (error) {
      console.error(error);
    }
  };
  //handle resize event
  const handleResizeEvent = ({ event }: EventResizeDoneArg) => {
    try {
      props.dispatch(
        updateEvent(event.id, {
          allDay: event.allDay,
          start: event.start,
          end: event.end
        })
      );
    } catch (error) {
      console.error(error);
    }
  };
  //handle edit event
  const handleCreateUpdateEvent = async (newEvent: ICalendarEventReqCreate) => {
    if (props.selectedEventId) {
      props.dispatch(updateEvent(props.selectedEventId, newEvent));
      props.enqueueSnackbar('Update success!');
    } else {
      // props.dispatch(createEvent(newEvent));
      const res = await axios.post('/api/calendar/events/new', newEvent);
      props.enqueueSnackbar('Create success!');
      getAllEvents();
    }
  };
  //handle deleted event
  const handleDeleteEvent = () => {
    try {
      if (props.selectedEventId) {
        handleCloseModal();
        props.dispatch(deleteEvent(props.selectedEventId));
        props.enqueueSnackbar('Delete success!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    getAllEvents,
    handleOpenFilter,
    // handleOpenModal,
    handleCloseModal,
    handleClickToday,
    handleChangeView,
    handleClickDatePrev,
    handleClickDateNext,
    handleSelectRange,
    handleSelectEvent,
    // handleFilterEventColor,
    handleResetFilter,
    handleDropEvent,
    handleResizeEvent,
    handleCreateUpdateEvent,
    handleDeleteEvent,
    loadAllDocCategories
  };
};
function CalendarContainer() {
  let props = calendarAttribute();
  const { localState, setLocalState } = props;
  let func = calendarFunction({
    props,
    state: localState,
    setState: setLocalState
  });
  useEffect(() => {
    func.getAllEvents();
  }, []);
  useEffect(() => {
    const calendarEl = props.calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      const newView = props.isDesktop ? 'dayGridMonth' : 'listWeek';
      calendarApi.changeView(newView);
      props.setLocalState((prevState: ILocalState) => ({
        ...prevState,
        view: newView
      }));
    }
  }, [props.isDesktop]);
  useEffect(() => {
    func.loadAllDocCategories();
    // if (selectedPost !== null) {
    //   if (selectedPost.category !== undefined) {
    //     setLocalState((prevState: ILocalState) => ({
    //       ...prevState,
    //       selectedCategoryId: (selectedPost.category as IDocCategory)._id
    //     }));
    //     setValue('category', (selectedPost.category as IDocCategory)._id);
    //   }
    // }
  }, []);

  return <CalendarComponent props={props} func={func} />;
}
export default CalendarContainer;
function applyFilter({
  inputData,
  filterEventColor,
  filterStartDate,
  filterEndDate,
  isError
}: {
  inputData: EventInput[];
  filterEventColor: string[];
  filterStartDate: Date | null;
  filterEndDate: Date | null;
  isError: boolean;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterEventColor.length) {
    inputData = inputData.filter((event: EventInput) =>
      filterEventColor.includes(event.color as string)
    );
  }

  if (filterStartDate && filterEndDate && !isError) {
    inputData = inputData.filter(
      (event: EventInput) =>
        fTimestamp(event.start as Date) >= fTimestamp(filterStartDate) &&
        fTimestamp(event.end as Date) <= fTimestamp(filterEndDate)
    );
  }

  return inputData;
}
