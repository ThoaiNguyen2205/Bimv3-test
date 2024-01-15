import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { IFile } from "src/shared/types/file";
import { BaseRedux } from "./BaseRedux";

interface fileState {
  datas: IFile[];
  selectedData: IFile | null;
  loading: boolean;

  setDatas: (files: IFile[]) => void;
  countDatas: () => void;
  addData: (file: IFile) => void;
  replaceData: (file: IFile) => void;
  removeData: (fileId: string) => void;
  setLoading: (value: boolean) => void;
  setSelectedData: (file: IFile | null) => void;

  selectedFiles: IFile[];
  setSelectedFiles: (files: IFile[]) => void;
  selectedImagePath: string | null;
  setSelectedImagePath: (path: string | null) => void;
}

const useFile = create<fileState>()((set, get) => ({
  ...BaseRedux(set, get),

  selectedFiles: [],
  setSelectedFiles: (files: IFile[]) => {
    set(() => ({ selectedFiles: files }));
  },
  selectedImagePath: null,
  setSelectedImagePath: (path: string | null) => {
    set(() => ({ selectedImagePath: path }));
  },
}));

export default useFile;
