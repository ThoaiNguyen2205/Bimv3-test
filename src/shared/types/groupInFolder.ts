import { IGroup } from "./group";
import { IProject } from "./project";
import { IFolder } from "./folder";

export type IGroupInFolderReqCreate = {
  folder?: string;
  group?: string;
  isEdit?: boolean;
  isUpdate?: boolean;
  isApprove?: boolean;
  isConfirm?: boolean;
  isDownload?: boolean;
}

export type IGroupInFolder = {
  _id: string;
  folder: IFolder | string;
  group: IGroup | string;
  isEdit: boolean;
  isUpdate: boolean;
  isApprove: boolean;
  isDownload: boolean;
  isConfirm: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IGroupInFolderResGetAll = {
  data: IGroupInFolder[];
  total: {
    count: number;
    _id: string;
  };
}