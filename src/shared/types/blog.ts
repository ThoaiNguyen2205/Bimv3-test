import { IUser } from "./user";
import { IDocCategory } from "./docCategory";

export type IBlogReqCreate = {
  title?: string;
  description?: string;
  content?: string;
  cover?: string;
  category?: string;
  createdBy?: string;
  isComment?: Date | null;
  isPublish?: Date | null;
}

export type IBlog = {
  _id: string;
  title: string;
  description: string;
  content?: string;
  cover: string;
  category: IDocCategory| string;
  createdBy: IUser | string;
  isPublish?: Date;
  isComment?: Date;
  views: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IBlogResGetAll = {
  data: IBlog[];
  total: {
    count: number;
    _id: string;
  };
}