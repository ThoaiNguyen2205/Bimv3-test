import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { IDocCategory } from "src/shared/types/docCategory";
import { BaseRedux } from "./BaseRedux";

interface docCategoryState {
  datas: IDocCategory[];
  selectedData: IDocCategory | null;
  loading: boolean;

  setDatas: (docCategories: IDocCategory[]) => void;
  countDatas: () => void;
  addData: (docCategory: IDocCategory) => void;
  replaceData: (docCategory: IDocCategory) => void;
  removeData: (docCategoryId: string) => void;
  setLoading: (value: boolean) => void;

  setSelectedData: (docCategory: IDocCategory | null) => void;
}

const useDocCategory = create<docCategoryState>()((set, get) => ({
  ...BaseRedux(set, get),
}));

export default useDocCategory;
