import { IUser } from "./user";
import { IGroup } from "./group";
import { IRequest } from "./request";
import { IFolder } from "./folder";

export type IRequestContentReqCreate = {
  request?: string;
  content?: string;
  createdBy?: string;
  createdGroup?: string;
}

export type IRequestContent = {
  _id: string;
  request: IRequest | string;
  content: string;
  createdBy: IUser | string;
  createdGroup: IGroup | string;
  isConfimed?: Date;
  isApproved?: Date;
  confimedBy?: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IRequestContentResGetAll = {
  data: IRequestContent[];
  total: {
    count: number;
    _id: string;
  };
}

export type IRequestContentDetails = {
  folderData: IFolder,
  strPath: string,
  preUpdateChecked: IGroup[],
  preApproveChecked: IGroup[],
  preConfirmChecked: IGroup[],
  requestContents: IRequestContent[],
}