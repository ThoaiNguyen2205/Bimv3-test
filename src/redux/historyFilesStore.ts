import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { IFile } from "src/shared/types/file";
import { BaseRedux } from "./BaseRedux";

interface historyFilesState {
  datas: IFile[];
  selectedData: IFile | null;
  loading: boolean;

  setDatas: (files: IFile[]) => void;
  countDatas: () => void;
  addData: (file: IFile) => void;
  replaceData: (file: IFile) => void;
  removeData: (fileId: string) => void;
  setLoading: (value: boolean) => void;
  setSelectedData: (folder: IFile | null) => void;
}

const useHistoryFiles = create<historyFilesState>()((set, get) => ({
  ...BaseRedux(set, get),
}));

export default useHistoryFiles;
