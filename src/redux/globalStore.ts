import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

interface globalState {
  rowsPerPageOptionsDefault: number[];
  rowsPerPage: number;
}

const useGlobal = create<globalState>()((set, get) => ({
  rowsPerPageOptionsDefault: [5, 10, 20, 50, 100],
  rowsPerPage: 10,
  
  setRowsPerPage: (value: number) => {
    set((state: globalState) => {
      return {
        ...state,
        rowsPerPage: value,
      }
    });
  },


}));

export default useGlobal;
