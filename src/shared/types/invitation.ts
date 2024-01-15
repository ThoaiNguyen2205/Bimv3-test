import { ICustomer } from "./customer";

export type IInvitationReqCreate = {
  fromEmail?: string,
  toEmail?: string,
  customer?: ICustomer,
  // confirmed?: boolean,
}

export type IInvitation = {
  _id: string;
  customer: ICustomer | string;
  fromEmail: string,
  toEmail: string,
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IInvitationResGetAll = {
  data: IInvitation[];
  total: {
    count: number;
    _id: string;
  };
}