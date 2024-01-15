import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { IDiscussion } from "src/shared/types/discussion";
import { BaseRedux } from "./BaseRedux";

interface discussionState {
  datas: IDiscussion[];
  selectedData: IDiscussion | null;
  loading: boolean;

  setDatas: (discussions: IDiscussion[]) => void;
  countDatas: () => void;
  addData: (discussion: IDiscussion) => void;
  replaceData: (discussion: IDiscussion) => void;
  removeData: (discussionId: string) => void;
  setLoading: (value: boolean) => void;
  setSelectedData: (discussions: IDiscussion | null) => void;
}

const useDiscussion = create<discussionState>()((set, get) => ({
  ...BaseRedux(set, get),
}));

export default useDiscussion;
