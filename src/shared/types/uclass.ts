import { ICustomer } from "./customer";
import { IUser } from './user';
import { IGroup } from "./group";

// -----------------------------------------------------

export type IUclass = {
  _id: string;
  user: IUser | string;
  customer: ICustomer | string;
  uclass: string;
  expired: Date;
  groupId: string;
  groupName: string;
  groupTitle: string;
  isKey: boolean;
  blockedAt?: Date | null;
  createdAt: Date;
  deletedAt?: Date;
}

export type IUclassReqCreate = {
  user?: string;
  customer?: string;
  uclass?: string;
  groupId?: string;
  groupName?: string;
  groupTitle?: string;
  isKey?: boolean;
  expired?: Date;
  updatedByName?: string;
  updatedById?: string;
}

export type IUclassResGetAll = {
  data: IUclass[];
  total: {
    count: number;
    _id: string;
  };
}