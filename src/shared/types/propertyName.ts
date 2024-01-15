import { IUser } from "./user";
import { ICustomer } from "./customer";

export type IPropertyNameReqCreate = {
  customer?: string;
  name?: string;
  color?: string;
  description?: string;
  createdBy?: string;
  updatedId?: string;
  updatedName?: string;
}

export type IPropertyName = {
  _id: string;
  customer: ICustomer | string;
  name: string;
  color: string;
  description: string;
  createdBy?: IUser;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IPropertyNameResGetAll = {
  data: IPropertyName[];
  total: {
    count: number;
    _id: string;
  };
}