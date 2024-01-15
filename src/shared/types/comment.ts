import { IUser } from './user';

export type ICommentReqCreate = {
  fatherId: string;
  content: string;
  createdBy?: string;
}

export type IComment = {
  _id: string;
  fatherId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: IUser | string;
  deletedAt?: Date;
};

export type ICommentResGetAll = {
  data: IComment[];
  total: {
    count: number;
    _id: string;
  };
};
