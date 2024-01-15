import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { IFolder, IFolderNodeData } from "src/shared/types/folder";
import { BaseRedux } from "./BaseRedux";

interface folderState {
  datas: IFolder[];
  selectedData: IFolder | null;
  loading: boolean;
  dataTree: IFolderNodeData[];

  setDatas: (folders: IFolder[]) => void;
  countDatas: () => void;
  addData: (folder: IFolder) => void;
  replaceData: (folder: IFolder) => void;
  removeData: (folderId: string) => void;
  setLoading: (value: boolean) => void;
  setSelectedData: (folder: IFolder | null) => void;
  setDataTree: (data: IFolderNodeData[]) => void;

  selectedFather: IFolder | null;
  setSelectedFather: (value: IFolder | null) => void;
  
  destination: string;
  setDestination: (value: string) => void;
}

const useFolder = create<folderState>()((set, get) => ({
  ...BaseRedux(set, get),
  
  selectedFather: null,
  setSelectedFather: (value: IFolder) => {
    set(() => ({ selectedFather: value }));
  },
  destination: '',
  setDestination: (value: string) => {
    set(() => ({ destination: value }));
  },
}));

export default useFolder;
