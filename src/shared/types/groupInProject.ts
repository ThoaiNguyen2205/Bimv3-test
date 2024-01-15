import { IGroup } from "./group";
import { IProject } from "./project";

export type IGroupInProjectReqCreate = {
  project?: string;
  group?: string;
  isAdmin?: boolean;
}

export type IGroupInProject = {
  _id: string;
  project: IProject | string;
  group: IGroup | string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IGroupInProjectResGetAll = {
  data: IGroupInProject[];
  total: {
    count: number;
    _id: string;
  };
}