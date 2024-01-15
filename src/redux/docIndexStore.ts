import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { IDocIndex } from "src/shared/types/docIndex";
import { BaseRedux } from "./BaseRedux";

interface docIndexState {
  datas: IDocIndex[];
  selectedData: IDocIndex | null;
  loading: boolean;

  setDatas: (docIndexs: IDocIndex[]) => void;
  countDatas: () => void;
  addData: (docIndex: IDocIndex) => void;
  replaceData: (docIndex: IDocIndex) => void;
  removeData: (docIndexId: string) => void;
  setLoading: (value: boolean) => void;

  setSelectedData: (docIndex: IDocIndex | null) => void;
}

const useDocIndex = create<docIndexState>()((set, get) => ({
  ...BaseRedux(set, get),
}));

export default useDocIndex;
