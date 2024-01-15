import { create } from 'zustand';

interface globalState {
  rowsPerPageOptionsDefault: number[];
  rowsPerPage: number;
}

const useGlobalPostsPerPage = create<globalState>()((set, get) => ({
  rowsPerPageOptionsDefault: [9, 18, 27, 36, 45],
  rowsPerPage: 9,

  setRowsPerPage: (value: number) => {
    set((state: globalState) => {
      return {
        ...state,
        rowsPerPage: value
      };
    });
  }
}));

export default useGlobalPostsPerPage;
