import { UserClassEnum, UserRoleEnum, UserStatusEnum } from "../enums";
import { ICustomer } from "./customer";
import { IGroup } from "./group";
import { IProject } from "./project";
import { IUclass } from "./uclass"
// ----------------------------------------------------------------------

export type IUserReqRegister = {
  fullname: string;
  username: string;
  email: string;
  password: string;
}

export type IUserReqLogin = {
  email: string;
  password: string;
}

export type IUserResLogin = {
  access_token: string;
  user: {
    _id: string;
  };
}

export type IUser = {
  about: string;
  active: boolean;
  activeCode: string;
  avatar: string;
  cover: string;
  blockedAt: Date | null;
  class: IUclass | string;
  customer: ICustomer | string;
  group: IGroup | string;
  isKey: boolean;
  dataMode: string | null;
  denseMode: string | null;
  email: string;
  fullname: string;
  partnership: string;
  phone: string;
  project: IProject | string;
  projectrole: string;
  role: string;
  status: string;
  username: string;
  id: string;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IUserReqUpdate = {
  role?: UserRoleEnum;
  fullname?: string;
  username?: string;
  password?: string;
  activeCode?: string;
  avatar?: string;
  cover?: string;
  phone?: string;
  partnership?: string;
  about?: string;
  group?: string | null;
  dataMode?: string;
  denseMode?: string;
  status?: UserStatusEnum;
  class?: string | null;
  customer?: string | null;
  project?: string | null;
  projectrole?: UserClassEnum;
  active?: boolean;
  blockedAt?: Date | null;
}

export type IUserResGetAll = {
  data: IUser[];
  total: {
    count: number;
    _id: string;
  };
}

export type IUserResRepass = {
  user: IUser[];
  newpass: string;
}

export type IUserDevice = {
  user: string,
  device_type: string,
  device_id: string,
  token: string,
}