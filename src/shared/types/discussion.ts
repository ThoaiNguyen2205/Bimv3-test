import { IUser } from "./user";
import { ICustomer } from "./customer";
import { IGroup } from "./group";
import { LogType, Approved } from "../enums";
import { IGroupInFolder } from "./groupInFolder";
import { IFile } from "./file";
import { IMainTask } from "./mainTask";

export type IDiscussionReqCreate = {
  customer?: string;
  groups?: string;
  approved?: Approved;
  from?: string;
  content?: string;
  task?: string;
  relativeid?: string;
  type?: LogType;
  link?: string;
  createdGroup?: string;
}

export type IDiscussion = {
  _id: string;
  customer: string;
  groups: string;
  approved: Approved;
  from: IUser | string;
  content: string;
  task: string;
  relativeid: string;
  type: LogType;
  link: string;
  createdGroup: IGroup | string;
  solution?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IDiscussionResGetAll = {
  data: IDiscussion[];
  total: {
    count: number;
    _id: string;
  };
}

export type IDetailsInfo = {
  groups: IGroupInFolder[];
  strPath: string;
  histories: IFile[];
  discussions: IDiscussion[];
  tasks: IMainTask[];
}

export type IInteractiveData = {
  days: string[],
  views: number[],
  markups: number[],
  files: number[],
  discussions: number[],
}
