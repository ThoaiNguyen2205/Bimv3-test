import { IUser } from './user';

// -----------------------------------------------------

export type ISystem = {
  _id: string;
  name: string;
  value: string;
  createdBy: IUser;
  createdAt: Date;
  deletedAt?: Date;
}

export type ISystemReqCreate = {
  name?: string;
  value?: string;
  createdBy?: string;
}

export type ISystemResGetAll = {
  data: ISystem[];
  total: {
    count: number;
    _id: string;
  };
}