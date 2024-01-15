import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { IGroup } from 'src/shared/types/group';
import { BaseRedux } from "./BaseRedux";

interface groupState {
  datas: IGroup[];
  selectedData: IGroup | null;
  loading: boolean;

  setDatas: (groups: IGroup[]) => void;
  countDatas: () => void;
  addData: (group: IGroup) => void;
  replaceData: (group: IGroup) => void;
  removeData: (groupId: string) => void;
  setLoading: (value: boolean) => void;

  setSelectedData: (group: IGroup | null) => void;
}

const useGroup = create<groupState>()((set, get) => ({
  ...BaseRedux(set, get),
}));

export default useGroup;
