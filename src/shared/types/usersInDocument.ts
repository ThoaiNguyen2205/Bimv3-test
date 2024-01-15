import { IUser } from "./user";
import { IBimDocument } from "./bimDocument";

export type IUserInDocumentReqCreate = {
  document?: string;
  user?: string;
  isComment?: boolean;
  isEdit?: boolean;
}

export type IUserInDocument = {
  _id: string;
  document: IBimDocument | string;
  user: IUser | string;
  isComment: boolean;
  isEdit: boolean;
  deletedAt?: Date;
}

export type IUserInDocumentResGetAll = {
  data: IUserInDocument[];
  total: {
    count: number;
    _id: string;
  };
}