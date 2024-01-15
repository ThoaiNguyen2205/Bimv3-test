import { IUser } from "./user";
import { ICustomer } from "./customer";
import { IGroup } from "./group";
import { LogType, Approved } from "../enums";
import { IContract } from "./contract";
import { IBlog } from "./blog";

export type INotificationReqCreate = {
  customer?: string;
  content?: string;
  actionLink?: string;
  type?: LogType;
  from?: IUser | string;
  to?: IUser | string;
  readAt?: Date;
}

export type INotification = {
  _id: string;
  customer: string;
  content: string;
  actionLink: string;
  type: LogType;
  from: IUser | string;
  to: IUser | string;
  readAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type INotificationResGetAll = {
  data: INotification[];
  total: {
    count: number;
    _id: string;
  };
}

export type IDashboardData = {
  contract: IContract;
  projects: { label: string, value: number}[],
  storages: { label: string, value: number}[],
  credits: { label: string, value: number}[],
  blogs: IBlog[],
}