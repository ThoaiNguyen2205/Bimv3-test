import { IUser } from "./user";
import { IProject } from "./project";
import { IFile } from "./file";
import { UserClassEnum } from "../enums";

export type IFolderReqCreate = {
  project?: string;
  path?: string;
  displayName?: string;
  storeName?: string;
  version?: string;
  isShared?: boolean;
  createdBy?: string;
  updatedId?: string;
  updatedName?: string;
  customer?: string;
}

export type IFolderPathReqCreate = {
  customer: string;
  fatherId: string;
  path: string;
  createId: string;
  createName: string;
}

export type IFolder = {
  _id: string;
  project: IProject | string;
  path: string;
  displayName: string;
  storeName: string;
  version: string;
  isShared: boolean;
  createdBy: IUser | string;
  createdAt: Date;
  updatedAt: Date;
  isView: boolean;
  isEdit: boolean;
  isUpdate: boolean;
  isDownload: boolean;
  isApprove: boolean;
  isConfirm: boolean;
  trashedAt?: Date;
  deletedAt?: Date;
}

export type IFolderResGetAll = {
  data: IFolder[];
  total: {
    count: number;
    _id: string;
  };
}

export type IFolderNode = {
  level: number;
  nodeId: string;
}

export type IFolderNodeData = {
  nodeId: string;
  node: IFolder;
  label: string;
  isShared: boolean;
  level: number;
  children: IFolderNodeData[];
}

export type IFolderLink = {
  id: string;
  name: string;
  path: string;
}

export type IFileAndFolder = {
  folders: IFolder[];
  files: IFile[];
}

export type IFileAndFolderSearching = {
  folders: { folder: IFolder, location: IFolder[] }[];
  files: { file: IFile, location: IFolder[] }[];
}

export type IFileOrFolder = {
  type: string;
  data: IFolder | IFile;
}

export type IFileOrFolderResGetAll = {
  data: IFileOrFolder[];
  total: {
    count: number;
  };
}

export type ISubFolderPermitReqCreate = {
  fatherId: string;
  groupIds: string; // stringify
  uid: string;
  role: UserClassEnum;
}

export type IFolderFullData = {
  folder: IFolder;
  linkList: IFolder[];
  subFolders: IFolder[];
  files: IFile[];
}