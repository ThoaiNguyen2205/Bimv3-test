import { IUser } from "./user";
import { ICustomer } from "./customer";

export type IContractReqCreate = {
  customer?: string;
  contractCode?: string;
  signedDate?: Date;
  projectNumber?: number;
  storage?: number;
  forgeCredit?: number;
  users?: number;
  expire?: Date;
  createdBy?: string;
}

export type IContract = {
  _id: string;
  customer: ICustomer | string;
  contractCode: string;
  signedDate: Date;
  projectNumber: number;
  storage: number;
  forgeCredit: number;
  users: number;
  expire: Date;
  createdBy: IUser | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IContractResGetAll = {
  data: IContract[];
  total: {
    count: number;
    _id: string;
  };
}

