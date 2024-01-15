import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { IUclass } from 'src/shared/types/uclass';
import { BaseRedux } from "./BaseRedux";

interface uclassState {
  datas: IUclass[];
  selectedData: IUclass | null;
  loading: boolean;

  setDatas: (uclasses: IUclass[]) => void;
  countDatas: () => void;
  addData: (uclass: IUclass) => void;
  replaceData: (uclass: IUclass) => void;
  removeData: (uclassId: string) => void;
  setLoading: (value: boolean) => void;

  setSelectedData: (uclass: IUclass | null) => void;
}

const useUclass = create<uclassState>()((set, get) => ({
  ...BaseRedux(set, get),
}));

export default useUclass;
