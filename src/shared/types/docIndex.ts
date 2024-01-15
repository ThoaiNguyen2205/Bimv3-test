import { IUser } from "./user";
import { IBimDocument } from "./bimDocument";

export type IDocIndexReqCreate = {
  document?: string;
  father?: string;
  title?: string;
  order?: number;
  views?: number;
  comments?: number;
  createdBy?: string;
  updatedBy?: string;
}

export type IDocIndex = {
  _id: string;
  document: IBimDocument | string;
  father: string;
  title: string;
  order: number;
  views: number;
  comments: number;
  createdBy: IUser | string;
  updatedBy: IUser | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IDocIndexResGetAll = {
  data: IDocIndex[];
  total: {
    count: number;
    _id: string;
  };
}

export type IDocIndexTreeData = {
  node: IDocIndex;
  children: IDocIndexTreeData[];
}