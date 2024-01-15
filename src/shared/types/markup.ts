import { IUser } from "./user";
import { IGroup } from "./group";
import { IMainTask } from "./mainTask";
import { TaskCategory } from "../enums";

export type IMarkupReqCreate = {
  task?: string;
  title?: string;
  fileid?: string;
  viewable?: string;
  viewstate?: string;
  markup?: string;
  type?: TaskCategory;
  createdBy?: string;
  createdGroup?: string;
}

export type IMarkup = {
  _id: string;
  task: IMainTask | string;
  title: string;
  fileid: string;
  viewable: string;
  viewstate: string;
  markup: string;
  type: TaskCategory;
  createdBy: IUser | string;
  createdGroup: IGroup | string;
  approved?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IMarkupResGetAll = {
  data: IMarkup[];
  total: {
    count: number;
    _id: string;
  };
}

// ==================================
// upgrade v3

export type IMarkupV3 = {
  _id: string;
  task: IMainTask | string;
  title: string;
  fileid?: string;
  viewable?: string;
  viewstate: string;
  markup: string;
  type: TaskCategory;
  createBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IMarkupV3ResGetAll = {
  data: IMarkupV3[];
  total: {
    count: number;
    _id: string;
  };
}