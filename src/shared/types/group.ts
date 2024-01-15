import { IUser } from "./user";
import { ICustomer } from "./customer";

export type IGroupReqCreate = {
  customer?: string;
  groupname?: string;
  logo?: string;
  title?: string;
  description?: string;
  color?: string;
  keyperson?: string;
  number?: number;
  createdBy?: string;
  updatedId?: string;
  updatedName?: string;
}

export type IGroup = {
  _id: string;
  customer: ICustomer | string;
  groupname: string;
  logo: string;
  title: string;
  description: string;
  color: string;
  keyperson: string;
  number: number;
  createdBy: IUser | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IGroupResGetAll = {
  data: IGroup[];
  total: {
    count: number;
    _id: string;
  };
}