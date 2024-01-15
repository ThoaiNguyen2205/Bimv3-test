import { IUser } from "./user";

export type ICustomerReqCreate = {
  name?: string;
  shortName?: string;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  phone?: string;
  taxCode?: string;
  logo?: string;
  createdBy?: string;
}

export type ICustomer = {
  _id: string;
  name: string;
  shortName: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  phone: string;
  taxCode: string;
  logo: string;
  blockedAt: Date | undefined | null;
  createdBy: IUser | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type ICustomerResGetAll = {
  data: ICustomer[];
  total: {
    count: number;
    _id: string;
  };
}

