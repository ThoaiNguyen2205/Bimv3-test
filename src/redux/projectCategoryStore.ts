import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { IProjectCategory } from "src/shared/types/projectCategory";
import { BaseRedux } from "./BaseRedux";

interface projectCategoryState {
  datas: IProjectCategory[];
  selectedData: IProjectCategory | null;
  loading: boolean;

  setDatas: (projectCategories: IProjectCategory[]) => void;
  countDatas: () => void;
  addData: (projectCategory: IProjectCategory) => void;
  replaceData: (projectCategory: IProjectCategory) => void;
  removeData: (projectCategoryId: string) => void;
  setLoading: (value: boolean) => void;

  setSelectedData: (projectCategory: IProjectCategory | null) => void;
}

const useProjectCategory = create<projectCategoryState>()((set, get) => ({
  ...BaseRedux(set, get),
}));

export default useProjectCategory;
