import { IUser } from "./user";
import { ICustomer } from "./customer";

export type IProjectCategoryReqCreate = {
  customer?: string;
  name?: string;
  logo?: string;
  description?: string;
  createdBy?: string;
  updatedId?: string;
  updatedName?: string;
}

export type IProjectCategory = {
  _id: string;
  customer: ICustomer | string;
  name: string;
  logo: string;
  description: string;
  createdBy: IUser | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IProjectCategoryResGetAll = {
  data: IProjectCategory[];
  total: {
    count: number;
    _id: string;
  };
}