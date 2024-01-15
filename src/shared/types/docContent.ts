import { IUser } from './user';
import { IDocIndex } from './docIndex';

export type IDocContentReqCreate = {
  index?: string;
  content?: string;
  versionNotes?: string;
  createdBy?: string;
};

export type IDocContent = {
  _id: string;
  index: IDocIndex | string;
  content: string;
  versionNotes: string;
  createdBy: IUser | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export type ITreeItem = {
  index: string;
  order: string;
  content: string;
  versionNotes: string;
};

export type IDocContentResGetAll = {
  data: IDocContent[];
  total: {
    count: number;
    _id: string;
  };
};
