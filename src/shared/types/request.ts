import { IUser } from "./user";
import { IGroup } from "./group";
import { IMainTask } from "./mainTask";
import { IFolder } from "./folder";

export type IRequestReqCreate = {
  task?: string;
  father?: string;
  title?: string;
  content?: string;
  folder?: string;
  attach?: string;
  createdBy?: string;
  createdGroup?: string;
}

export type IRequest = {
  _id: string;
  task: IMainTask | string;
  father: string;
  title: string;
  content: string;
  folder: IFolder | string;
  attach: string;
  createdBy: IUser | string;
  createdGroup: IGroup | string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  deletedAt?: Date;
}

export type IRequestResGetAll = {
  data: IRequest[];
  total: {
    count: number;
    _id: string;
  };
}

export type IRequestTreeData = {
  node: IRequest;
  children: IRequestTreeData[];
}

export type IRequestTaskData = {
  task: IMainTask;
  requestTree: IRequestTreeData[];
  allRequest: IRequest[];
  allTasks: IMainTask[];
}
