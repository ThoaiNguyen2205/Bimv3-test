import { IUser } from "./user";
import { IMainTask } from "./mainTask";

export type ITaskViewReqCreate = {
  task?: string;
  createdBy?: string;
}

export type ITaskView = {
  _id: string;
  task: IMainTask | string;
  createdBy: IUser | string;
  createdAt: Date;
}

export type ITaskViewResGetAll = {
  data: ITaskView[];
  total: {
    count: number;
    _id: string;
  };
}