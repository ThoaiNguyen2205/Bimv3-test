import { IUser } from "src/shared/types/user";
import { IGroup } from "src/shared/types/group";

export type IGroupUser = {
  _id: string;
  user: IUser;
  group: IGroup;
  isKey:boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
  
export type IGroupUserResGetAll = {
  data: IGroupUser[];
  total: {
    count: number;
    _id: string;
  };
}