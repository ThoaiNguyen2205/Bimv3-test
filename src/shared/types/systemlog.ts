import { IUser } from "./user";
import { ICustomer } from "./customer";

export type ISystemLogReqCreate = {
  customer?: string;
  father?: string;
  content?: string;
  type?: string;
  actionLink?: string;
  createdBy?: string;
}

export type ISystemLog = {
  _id: string;
  customer: string;
  father: string;
  content: string;
  type: string;
  actionLink: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type ISystemLogResGetAll = {
  data: ISystemLog[];
  total: {
    count: number;
    _id: string;
  };
}