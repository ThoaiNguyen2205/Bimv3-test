import { values } from 'lodash';
import { create } from 'zustand';
import { BaseRedux } from '../BaseRedux';

import { ICalendarEvent } from 'src/shared/types/calendar';
import { ICalendarViewValue } from 'src/@types/calendar';
//type
interface bimCalendarState {
  datas: ICalendarEvent[];
  selectedData: ICalendarEvent | null | undefined;
  loading: boolean;

  setDatas: (bimCalendar: ICalendarEvent[]) => void;
  countDatas: () => void;
  addData: (bimCalendar: ICalendarEvent) => void;
  replaceData: (bimCalendar: ICalendarEvent) => void;
  removeData: (bimCalendar: string) => void;
  setLoading: (value: boolean) => void;
  setSelectedData: (bimDocument: ICalendarEvent | null | undefined) => void;
  //
  content: string;
  openForm: boolean;
  openFilter: boolean;
  filterEventColor: string[];
  view: ICalendarViewValue;
  selectedEventId: string | null;
  //
  setContent: (newValue: string) => void;
  setOpenForm: (value: boolean) => void;
  setOpenFilter: (value: boolean) => void;
  setFilterEventColor: (value: string[]) => void;
  handleFilterEventColor: (eventColor: string) => void;
  setView: (value: ICalendarViewValue) => void;
  setSelectedEventId: (newValue: string | null) => void;
}

const useCalendarStore = create<bimCalendarState>()((set, get) => ({
  ...BaseRedux(set, get),
  content: '',
  openForm: false,
  openFilter: false,
  filterEventColor: [],
  view: 'dayGridMonth',
  selectedEventId: null,
  //
  setContent: (newValue: string) => {
    set((state: bimCalendarState) => ({
      ...state,
      content: newValue
    }));
  },
  setOpenForm: (value: boolean) => {
    set((state: bimCalendarState) => ({
      ...state,
      openForm: value
    }));
  },
  setOpenFilter: (value: boolean) => {
    set((state: bimCalendarState) => ({
      ...state,
      openFilter: value
    }));
  },
  setFilterEventColor: (value: string[]) => {
    set((state: bimCalendarState) => ({
      ...state,
      filterEventColor: value
    }));
  },
  handleFilterEventColor: (eventColor: string) => {
    const checked = get().filterEventColor.includes(eventColor)
      ? get().filterEventColor.filter((value) => value !== eventColor)
      : [...get().filterEventColor, eventColor];
    set((state: bimCalendarState) => ({
      ...state,
      filterEventColor: checked
    }));
  },
  setView: (value: ICalendarViewValue) => {
    set((state: bimCalendarState) => ({
      ...state,
      view: value
    }));
  },
  setSelectedEventId: (newValue: string | null) => {
    set((state: bimCalendarState) => ({
      ...state,
      selectedEventId: newValue
    }));
  }
}));

export default useCalendarStore;
