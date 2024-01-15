import { IUser } from "./user";
import { IDocCategory } from "./docCategory";

export type IBimDocumentReqCreate = {
  title?: string;
  description?: string;
  cover?: string;
  category?: string;
  createdBy?: string;
  isComment?: Date | null;
  isPublish?: Date | null;
}

export type IBimDocument = {
  _id: string;
  title: string;
  description: string;
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

export type IBimDocumentResGetAll = {
  data: IBimDocument[];
  total: {
    count: number;
    _id: string;
  };
}