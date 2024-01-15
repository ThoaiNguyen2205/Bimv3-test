import { IDocCategory } from './docCategory';
import { IUser } from './user';

export type ICalendarEventReqCreate = {
  allDay: boolean;
  title: string;
  content?: string;
  category: IDocCategory;
  color: string;
  startDate: Date;
  endDate: Date;
};
export type ICalendarEvent = {
  _id: string;
  allDay: boolean;
  color: string;
  title: string;
  content: string;
  category: IDocCategory;
  startDate: Date;
  endDate: Date;
  createdBy: IUser | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};
export type ICalendarEventResGetAll = {
  data: ICalendarEvent[];
  total: {
    count: number;
    _id: string;
  };
};
