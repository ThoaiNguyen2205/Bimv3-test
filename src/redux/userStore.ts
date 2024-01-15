import { create } from "zustand"
import { devtools, persist } from 'zustand/middleware'

// type
import { IUser } from 'src/shared/types/user';
import { BaseRedux } from "./BaseRedux";

interface userState {
  datas: IUser[];
  selectedData: IUser | null;
  loading: boolean;

  setDatas: (users: IUser[]) => void;
  countDatas: () => void;
  addData: (user: IUser) => void;
  setLoading: (value: boolean) => void;

  setSelectedData: (user: IUser | null) => void;
}

const useUser = create<userState>()((set, get) => ({
  ...BaseRedux(set, get),

}));

export default useUser;
