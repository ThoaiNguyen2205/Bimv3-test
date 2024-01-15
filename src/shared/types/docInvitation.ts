import { IBimDocument } from "./bimDocument";

export type IDocInvitationReqCreate = {
  document?: string,
  fromEmail?: string,
  toEmail?: string,
  isEdit?: boolean,
  isComment?: boolean,
}

export type IDocInvitation = {
  _id: string;
  document: IBimDocument | string;
  fromEmail: string,
  toEmail: string,
  isEdit: boolean,
  isComment: boolean,
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IDocInvitationResGetAll = {
  data: IDocInvitation[];
  total: {
    count: number;
    _id: string;
  };
}