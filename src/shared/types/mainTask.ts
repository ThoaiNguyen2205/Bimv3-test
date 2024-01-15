import { IUser } from "./user";
import { IProject } from "./project";
import { IFolder } from "./folder";
import { IGroup } from "./group";
import { TaskCategory } from "../enums";
import { IDiscussion } from "./discussion";
import { IGroupInFolder } from "./groupInFolder";

export type IMainTaskReqCreate = {
  project?: string;
  name?: string;
  description?: string;
  note?: string;
  category?: TaskCategory;
  logo?: string;
  color?: string;
  folder?: string;
  attach?: string;
  view?: number;
  calendarId?: string;
  createdBy?: string;
  createdGroup?: string;
  updatedId?: string;
  updatedName?: string;
}

export type IMainTask = {
  _id: string;
  project: IProject | string;
  name: string;
  description: string;
  note: string;
  category: TaskCategory;
  logo: string;
  color: string;
  folder: IFolder | string;
  attach: string;
  view: number;
  calendarId: string;
  createdBy: IUser | string;
  createdGroup: IGroup | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  //
  isView?: boolean;
  isEdit?: boolean;
  isUpdate?: boolean;
  isDownload?: boolean;
  isApprove?: boolean;
  isConfirm?: boolean;
}

export type IMainTaskResGetAll = {
  data: IMainTask[];
  total: {
    count: number;
    _id: string;
  };
}

export type IDiscussionTask = {
  mainTask: IMainTask;
  discussions: IDiscussion[];
  groups: IGroupInFolder[],
  strPath: string,
}