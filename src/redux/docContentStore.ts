import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { IDocContent } from "src/shared/types/docContent";
import { BaseRedux } from "./BaseRedux";

interface docContentState {
  datas: IDocContent[];
  selectedData: IDocContent | null;
  loading: boolean;

  setDatas: (docContents: IDocContent[]) => void;
  countDatas: () => void;
  addData: (docContent: IDocContent) => void;
  replaceData: (docContent: IDocContent) => void;
  removeData: (docContentId: string) => void;
  setLoading: (value: boolean) => void;

  setSelectedData: (docContent: IDocContent | null) => void;
}

const useDocContent = create<docContentState>()((set, get) => ({
  ...BaseRedux(set, get),
}));

export default useDocContent;
