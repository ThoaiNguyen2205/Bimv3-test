import { IUser } from "./user";
import { IProject } from "./project";
import { IFolder } from "./folder";
import { UserClassEnum } from "../enums";

export type IFileReqCreate = {
  project?: string;
  folder?: string;
  displayName?: string;
  storeFile?: string;
  size?: string;
  version?: string;
  subVersion?: string;
  thumbnail?: string;
  convertFile?: string;
  isShared?: boolean;
  updatedBy?: string;
}

export type IFileReqCopy = {
  originFile: string;
  destinationFile: string;
}

export type IFileZipReq = {
  files: string;
  userId: string;
  role: UserClassEnum;
}

export type IFile = {
  _id: string;
  project: IProject | string;
  folder: IFolder | string;
  fullPath: string;
  displayName: string;
  storeFile: string;
  size: string;
  version: string;
  subVersion: string;
  thumbnail: string;
  convertFile: string;
  isShared: boolean;
  updatedBy: IUser | string;
  createdAt: Date;
  updatedAt: Date;
  trashedAt?: Date;
  isConfimed?: Date;
  isApproved?: Date;
  confimedBy?: string;
  approvedBy?: string;
  deletedAt?: Date;
}

export type IFileResGetAll = {
  data: IFile[];
  total: {
    count: number;
    _id: string;
  };
}

// Dùng cho upload folder
export type IFileFolderUpload = {
  filePath: string;
  fileName: string;
  file: File;
  folder: IFolder;
}