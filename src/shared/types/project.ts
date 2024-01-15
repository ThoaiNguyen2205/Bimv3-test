import { IUser } from "./user";
import { ICustomer } from "./customer";
import { IProjectCategory } from "./projectCategory";

export type IProjectReqCreate = {
  customer?: string;
  name?: string;
  category?: string;
  address?: string;
  description?: string;
  note?: string;
  star?: number;
  avatar?: string;
  createdBy?: string;
  blockedAt?: Date;
  updatedId?: string;
  updatedName?: string;
}

export type IProject = {
  _id: string;
  customer: ICustomer | string;
  category: IProjectCategory | string;
  name: string;
  address: string;
  description: string;
  note: string;
  star: number;
  avatar: string;
  createdBy: IUser | string;
  blockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IProjectResGetAll = {
  data: IProject[];
  total: {
    count: number;
    _id: string;
  };
}