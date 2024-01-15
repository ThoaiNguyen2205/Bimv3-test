import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { IMarkup } from 'src/shared/types/markup';
import { BaseRedux } from "./BaseRedux";

interface markupState {
  datas: IMarkup[];
  selectedData: IMarkup | null;
  loading: boolean;

  setDatas: (markups: IMarkup[]) => void;
  countDatas: () => void;
  addData: (markup: IMarkup) => void;
  replaceData: (markup: IMarkup) => void;
  removeData: (markupId: string) => void;
  setLoading: (value: boolean) => void;

  setSelectedData: (markup: IMarkup | null) => void;
}

const useMarkup = create<markupState>()((set, get) => ({
  ...BaseRedux(set, get),
}));

export default useMarkup;
