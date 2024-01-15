import { IUser } from "./user";
import { IMainTask } from "./mainTask";
import { IGroup } from "./group";
import { IFile } from "./file";

export type IForgeObjectReqCreate = {
  task?: string;
  urn?: string;
  file?: string;
  text?: string;
  displayName?: string;
  xform?: string;
  order?: number;
  version?: string;
  subVersion?: string;
  checked?: boolean;
  updatedBy?: string;
  createdGroup?: string;
}

export type IForgeObject = {
  _id: string;
  task: IMainTask | string;
  urn: string;
  file: IFile | string;
  text: string;
  displayName: string;
  xform: string;
  order: number;
  version: string;
  subVersion: string;
  checked: boolean;
  updatedBy: IUser | string;
  createdGroup: IGroup | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IForgeObjectResGetAll = {
  data: IForgeObject[];
  total: {
    count: number;
    _id: string;
  };
}

export type IForgeObjectData = {
  forgeObject: IForgeObject;
  history: IForgeObject[];
}

export type ICollaborationTaskData = {
  task: IMainTask;
  forgeObjectData: Array<IForgeObjectData>;
}

export type IMarkupSettings = {
  strokeWidth: number,
  strokeColor: string,
  strokeOpacity: number,
  fillColor: string,
  fillOpacity: number,
  fontSize: number,
}