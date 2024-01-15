import { IUser } from "./user";
import { ICustomer } from "./customer";

export type IBimnextAppReqCreate = {
  customer?: string;
  AppIMEI?: string;
  createdBy?: string;
}

export type IBimnextApp = {
  _id: string;
  customer: ICustomer | string;
  AppIMEI: string;
  createdBy: IUser | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IBimnextAppResGetAll = {
  data: IBimnextApp[];
  total: {
    count: number;
    _id: string;
  };
}

export type IBimnextAppRemoveMany = {
  acknowledged: boolean,
  deletedCount: number
}

