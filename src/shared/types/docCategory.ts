import { IUser } from "./user";
import { ICustomer } from "./customer";

export type IDocCategoryReqCreate = {
  name?: string;
  description?: string;
  color?: string;
  star?: number;
  posts?: number;
  avatar?: string;
  father?: string;
  createdBy?: string;
}

export type IDocCategory = {
  _id: string;
  name: string;
  description: string;
  color: string;
  star: number;
  posts: number;
  avatar: string;
  father: string;
  publicedAt?: Date;
  createdBy: IUser | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IDocCategoryResGetAll = {
  data: IDocCategory[];
  total: {
    count: number;
    _id: string;
  };
}

export type IDocCategoryTreeData = {
  node: IDocCategory;
  children: IDocCategoryTreeData[];
}

