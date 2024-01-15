import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { ISystem } from 'src/shared/types/system';
import { BaseRedux } from "./BaseRedux";

interface systemState {
  datas: ISystem[];
  selectedData: ISystem | null;
  loading: boolean;

  setDatas: (groups: ISystem[]) => void;
  setLoading: (value: boolean) => void;
  setSelectedData: (group: ISystem | null) => void;
}

const useSystem = create<systemState>()((set, get) => ({
  ...BaseRedux(set, get),
}));

export default useSystem;
